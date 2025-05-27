package com.browncs._final.model;

import java.util.List;
import java.util.Map;
import lombok.Data;

/**
 * Represents a scheduling event, including all metadata for participants, availability,
 * preferences, and computed optimal time slots.
 */
@Data
public class Event {
  // Firestore-generated document ID
  private String id;

  // Basic event metadata
  private String title;
  private String organizerEmail;
  private List<String> participantEmails;

  // Available days and time window (e.g., 09:00 to 21:00)
  private List<String> availableDays;
  private String startTime;
  private String endTime;
  private int durationMinutes;

  // Importance of each participant's attendance (e.g., 1 = preferred, 5 = required)
  private Map<String, Integer> participantNecessity; // "email" → 0, 1, 2

  // Optimized slot groupings calculated by the backend
  private List<SlotBlock> optimalSlots;

  /**
   * Participant-submitted availability preferences. Structure: email → (timespanId →
   * preferenceValue) Example: "alice@example.com" → { "10:00-10:30@2025-05-01": 3 }
   */
  private Map<String, Map<String, Integer>> submittedPreferences;

  // Explicitly rejected invitations
  private List<String> rejectedParticipants;

  // Explicitly accepted invitations
  private List<String> confirmedParticipants;

  // Lombok creates setters and getters
  public Event() {}
}
