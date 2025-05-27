package com.browncs._final.controller;

import com.browncs._final.model.Event;
import com.browncs._final.service.EventService;
import com.browncs._final.service.SlotService;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing event-related operations. Handles event creation, retrieval,
 * deletion, and invitation responses.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EventController {

  @Autowired private EventService eventService;
  @Autowired private SlotService slotService;

  /**
   * GET /events?email=... Retrieves all events associated with the given email (organizer or
   * participant).
   */
  @GetMapping("/events")
  public List<Event> getUserEvents(@RequestParam String email)
      throws ExecutionException, InterruptedException {
    return this.eventService.getEventsForEmail(email);
  }

  /**
   * POST /users/{email}/events Creates a new event on behalf of the given user, generates
   * corresponding slot data.
   */
  @PostMapping("/users/{email}/events")
  public ResponseEntity<String> createEventForUser(
      @PathVariable String email, @RequestBody Event newEvent) {
    try {
      newEvent.setOrganizerEmail(email); // enforce backend trust
      String id = this.eventService.createEvent(newEvent);
      this.slotService.generateSlots(id, newEvent);
      return ResponseEntity.ok("Created event with ID: " + id);
    } catch (IllegalArgumentException e) {
      e.printStackTrace();
      return ResponseEntity.ok("Invalid event body: " + e.getMessage());
    } catch (ExecutionException | InterruptedException e) {
      e.printStackTrace();
      return ResponseEntity.status(500)
          .body("Server error while processing the request: " + e.getMessage());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
    }
  }

  /** DELETE /delete/{eventId} Deletes the event with the given ID. */
  @DeleteMapping("/delete/{eventId}")
  public ResponseEntity<String> deleteEvent(@PathVariable String eventId) {
    try {
      this.eventService.deleteEventById(eventId);
      return ResponseEntity.ok("Event deleted successfully.");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(404).body("Could not find event: " + e.getMessage());
    } catch (ExecutionException | InterruptedException e) {
      return ResponseEntity.status(500)
          .body("Server error while processing the request: " + e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Error deleting event: " + e.getMessage());
    }
  }

  /**
   * POST /events/{eventId}/respond?userEmail=...&status=accept|reject Records a participant's
   * response to an event invitation.
   */
  @PostMapping("/events/{eventId}/respond")
  public ResponseEntity<String> respondToInvitation(
      @PathVariable String eventId,
      @RequestParam String userEmail,
      @RequestParam String status) { // "accept" or "reject"
    try {
      boolean isAccept = "accept".equalsIgnoreCase(status);
      this.eventService.recordInvitationResponse(eventId, userEmail, isAccept);
      return ResponseEntity.ok("Invitation " + status + "ed successfully.");
    } catch (Exception e) {
      return ResponseEntity.status(500)
          .body("Error processing invitation response: " + e.getMessage());
    }
  }

  /** GET /events/{eventId} Retrieves the full Event object by its ID. */
  @GetMapping("/events/{eventId}")
  public ResponseEntity<Event> getEventById(@PathVariable String eventId) {
    try {
      Event event = eventService.loadEventById(eventId);
      return ResponseEntity.ok(event);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(404).body(null);
    } catch (Exception e) {
      return ResponseEntity.status(500).body(null);
    }
  }
}
