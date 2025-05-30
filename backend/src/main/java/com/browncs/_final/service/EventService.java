package com.browncs._final.service;

import com.browncs._final.model.Event;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Service;

/**
 * Service responsible for managing event creation, retrieval, updates, deletion, and user
 * invitation responses. Interacts with Firestore and handles participant organization and state
 * tracking.
 */
@Service
public class EventService {

  private final Firestore db;
  private final EmailService emailService;

  public EventService(Firestore db, EmailService emailService) {
    this.db = db;
    this.emailService = emailService;
  }

  /**
   * Retrieves all events that the given email is either organizing or participating in.
   *
   * @param email The user email to query
   * @return List of events associated with the email
   */
  public List<Event> getEventsForEmail(String email)
      throws ExecutionException, InterruptedException {
    Query query =
        this.db
            .collection("events")
            .where(
                Filter.or(
                    Filter.equalTo("organizerEmail", email),
                    Filter.arrayContains("participantEmails", email)));

    ApiFuture<QuerySnapshot> future = query.get();
    return future.get().getDocuments().stream()
        .map(
            doc -> {
              Event event = doc.toObject(Event.class);
              event.setId(doc.getId());
              return event;
            })
        .toList();
  }

  /**
   * Creates a new event, updates user records for organizer and participants, and sends invitation
   * emails to participants.
   *
   * @param event Event object to be saved
   * @return ID of the newly created event
   */
  public String createEvent(Event event) throws ExecutionException, InterruptedException {
    DocumentReference eventRef = this.db.collection("events").document(); // Auto-ID
    event.setId(eventRef.getId());

    db.runTransaction(
            transaction -> {
              // 1. Create the event document
              transaction.set(eventRef, event);

              // 2. Update organizer's eventsOrganized
              DocumentReference organizerRef =
                  this.db.collection("users").document(event.getOrganizerEmail());
              transaction.set(
                  organizerRef,
                  Map.of("eventsOrganized", FieldValue.arrayUnion(event.getId())),
                  SetOptions.merge());

              // 3. Update each participant's eventsParticipating
              for (String participant : event.getParticipantEmails()) {
                DocumentReference participantRef =
                    this.db.collection("users").document(participant);
                transaction.set(
                    participantRef,
                    Map.of("eventsParticipating", FieldValue.arrayUnion(event.getId())),
                    SetOptions.merge());
              }

              return null;
            })
        .get();

    // Send emails
    for (String participant : event.getParticipantEmails()) {
      emailService.sendEventInvite(participant, event.getTitle());
    }

    return event.getId();
  }

  /**
   * Deletes the event by ID, including all associated slot subdocuments, and updates organizer and
   * participant user references.
   *
   * @param eventId The ID of the event to delete
   */
  public void deleteEventById(String eventId) throws ExecutionException, InterruptedException {
    DocumentReference eventRef = this.db.collection("events").document(eventId);

    // 0. Delete all slots BEFORE the transaction
    ApiFuture<QuerySnapshot> slotsFuture = eventRef.collection("slots").get();
    List<QueryDocumentSnapshot> slots = slotsFuture.get().getDocuments();
    for (QueryDocumentSnapshot slot : slots) {
      slot.getReference().delete();
    }

    // 1. Transaction to delete event and update user references
    db.runTransaction(
            transaction -> {
              DocumentSnapshot snapshot = transaction.get(eventRef).get();
              if (!snapshot.exists()) {
                throw new IllegalArgumentException("Event not found: " + eventId);
              }

              Event event = snapshot.toObject(Event.class);

              // Delete the event document
              transaction.delete(eventRef);

              // Remove from organizer's eventsOrganized
              DocumentReference organizerRef =
                  this.db.collection("users").document(event.getOrganizerEmail());
              transaction.update(organizerRef, "eventsOrganized", FieldValue.arrayRemove(eventId));

              // Remove from each participant's eventsParticipating
              for (String participant : event.getParticipantEmails()) {
                DocumentReference participantRef =
                    this.db.collection("users").document(participant);
                transaction.update(
                    participantRef, "eventsParticipating", FieldValue.arrayRemove(eventId));
              }

              return null;
            })
        .get();
  }

  /**
   * Records a user's response to an event invitation. Updates confirmed/rejected status and removes
   * users from participant lists if they reject.
   *
   * @param eventId The event the user is responding to
   * @param userEmail The user's email address
   * @param isAccept Whether the invitation is accepted (true) or rejected (false)
   */
  public void recordInvitationResponse(String eventId, String userEmail, boolean isAccept)
      throws ExecutionException, InterruptedException {
    DocumentReference eventRef = db.collection("events").document(eventId);
    DocumentReference userRef = db.collection("users").document(userEmail);

    db.runTransaction(
            transaction -> {
              // Read all documents first
              DocumentSnapshot eventSnapshot = transaction.get(eventRef).get();
              DocumentSnapshot userSnapshot = transaction.get(userRef).get();

              if (!eventSnapshot.exists()) {
                throw new IllegalArgumentException("Event not found: " + eventId);
              }

              Event event = eventSnapshot.toObject(Event.class);

              // Defensive handling in case fields are null
              Set<String> rejected =
                  new HashSet<>(
                      Optional.ofNullable(event.getRejectedParticipants())
                          .orElse(new ArrayList<>()));
              Set<String> confirmed =
                  new HashSet<>(
                      Optional.ofNullable(event.getConfirmedParticipants())
                          .orElse(new ArrayList<>()));
              List<String> participants =
                  Optional.ofNullable(event.getParticipantEmails()).orElse(new ArrayList<>());
              Map<String, Integer> necessity =
                  Optional.ofNullable(event.getParticipantNecessity()).orElse(new HashMap<>());

              if (isAccept) {
                rejected.remove(userEmail); // Clear any previous rejection
                confirmed.add(userEmail); // Mark as confirmed
              } else {
                participants.remove(userEmail); // Remove from participant list
                necessity.remove(userEmail); // Remove from necessity map
                rejected.add(userEmail); // Mark as rejected
                confirmed.remove(userEmail); // Clear any previous acceptance
              }

              // Update event with modified lists
              event.setRejectedParticipants(new ArrayList<>(rejected));
              event.setConfirmedParticipants(new ArrayList<>(confirmed));
              event.setParticipantEmails(participants);
              event.setParticipantNecessity(necessity);

              // Write event updates
              transaction.set(eventRef, event);

              // Write user updates if rejecting
              if (!isAccept && userSnapshot.exists()) {
                List<String> participatingEvents =
                    (List<String>) userSnapshot.get("eventParticipating");
                if (participatingEvents != null) {
                  participatingEvents.remove(eventId);
                  transaction.update(userRef, "eventParticipating", participatingEvents);
                }
              }

              return null;
            })
        .get();
  }

  /**
   * Loads a single event by ID.
   *
   * @param eventId ID of the event to retrieve
   * @return Event object with ID populated
   */
  public Event loadEventById(String eventId) throws ExecutionException, InterruptedException {
    DocumentSnapshot doc = this.db.collection("events").document(eventId).get().get();
    if (!doc.exists()) {
      throw new IllegalArgumentException("Event not found: " + eventId);
    }
    Event event = doc.toObject(Event.class);
    assert event != null;
    event.setId(doc.getId());
    return event;
  }

  /**
   * Updates an existing event document by replacing it entirely with a new version.
   *
   * @param eventId ID of the event to update
   * @param updatedEvent The new Event object to replace the old one
   */
  public void updateEvent(String eventId, Event updatedEvent)
      throws ExecutionException, InterruptedException {
    DocumentReference eventRef = db.collection("events").document(eventId);

    db.runTransaction(
            transaction -> {
              // Step 1: Validate existence
              DocumentSnapshot snapshot = transaction.get(eventRef).get();
              if (!snapshot.exists()) {
                throw new IllegalArgumentException("Event not found: " + eventId);
              }

              // Step 2: Overwrite the document with the updated event object
              transaction.set(eventRef, updatedEvent);

              return null;
            })
        .get();
  }
}
