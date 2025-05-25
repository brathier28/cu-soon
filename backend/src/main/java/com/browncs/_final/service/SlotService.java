package com.browncs._final.service;

import com.browncs._final.model.Event;
import com.browncs._final.model.PreferenceRequest;
import com.browncs._final.model.Slot;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SlotService {

  private final Firestore db = FirestoreClient.getFirestore();
  private static final Logger logger = LoggerFactory.getLogger(SlotService.class);

  public void submitPreferences(String eventId, PreferenceRequest request) {

    CollectionReference slots = db.collection("events").document(eventId).collection("slots");
    String userEmail = request.getUserEmail();
    DocumentReference eventRef = db.collection("events").document(eventId);

    // 1. Handle deletions
    for (String timespanId : request.getDeletedTimespanIds()) {
      try {
        String[] parts = timespanId.split("@");
        String[] timeRange = parts[0].split("-");
        String date = parts[1];

        LocalTime start = LocalTime.parse(timeRange[0]);
        LocalTime end = LocalTime.parse(timeRange[1]);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        while (start.isBefore(end)) {
          String slotTime = start.format(formatter);
          String slotId = date + "T" + slotTime;
          DocumentReference slotRef = slots.document(slotId);
          slotRef.update(FieldPath.of("participantWeights", userEmail), FieldValue.delete());
          start = start.plusMinutes(15);
        }

      } catch (Exception e) {
        System.err.println("Failed to parse/delete: " + timespanId);
        e.printStackTrace();
      }
    }

    // 2. Handle new or updated rankings
    for (Map.Entry<String, Integer> entry : request.getRankings().entrySet()) {
      String timespanId = entry.getKey(); // e.g., "17:00-18:30@2025-04-29"
      Integer preference = entry.getValue();

      // Parse the timespan string
      String[] parts = timespanId.split("@");
      String[] timeRange = parts[0].split("-");
      String date = parts[1]; // e.g., "2025-04-29"
      LocalTime start = LocalTime.parse(timeRange[0]); // e.g., "17:00"
      LocalTime end = LocalTime.parse(timeRange[1]); // e.g., "18:30"

      DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

      // Expand into 15-minute intervals
      while (start.isBefore(end)) {
        String slotTime = start.format(timeFormatter); // e.g., "17:00"
        String slotId = date + "T" + slotTime; // e.g., "2025-04-29T17:00"

        DocumentReference slotRef = slots.document(slotId);
        slotRef.update(FieldPath.of("participantWeights", request.getUserEmail()), preference);
        start = start.plusMinutes(15);
      }
    }

    if (request.getRankings().isEmpty()) {
      eventRef.update(
          FieldPath.of("submittedPreferences", request.getUserEmail()), FieldValue.delete());
    } else {
      eventRef.update(
          FieldPath.of("submittedPreferences", request.getUserEmail()), request.getRankings());
    }
  }

  public void generateSlots(String eventId, Event event) {
    List<String> days = event.getAvailableDays();
    LocalTime start = LocalTime.parse(event.getStartTime()); // e.g., "09:00"
    LocalTime end = LocalTime.parse(event.getEndTime()); // e.g., "21:00"
    int slotLength = 15; // fixed interval

    DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
    CollectionReference slotCol =
        this.db.collection("events").document(eventId).collection("slots");

    for (String dayStr : days) {
      LocalDate date = LocalDate.parse(dayStr);
      LocalTime current = start;

      while (!current.isAfter(end.minusMinutes(slotLength))) {
        String slotId = date + "T" + current.format(timeFmt);

        Slot slot = new Slot();
        slot.setId(slotId);
        slot.setDate(date.toString());
        slot.setStartTime(current.format(timeFmt));
        slot.setParticipantWeights(new HashMap<>());

        slotCol.document(slotId).set(slot);
        current = current.plusMinutes(slotLength);
      }
    }
  }

  public List<Slot> getPreferences(String eventId) throws ExecutionException, InterruptedException {
    CollectionReference slotCol = db.collection("events").document(eventId).collection("slots");
    List<Slot> slots =
        slotCol.get().get().getDocuments().stream()
            .map(
                doc -> {
                  Slot slot = doc.toObject(Slot.class);
                  slot.setId(doc.getId()); // explicitly set the ID from Firestore
                  return slot;
                })
            .sorted(Comparator.comparing(Slot::getId))
            .toList();

    return slots;
  }
}
