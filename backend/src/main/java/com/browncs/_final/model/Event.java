package com.browncs._final.model;

import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class Event {
  private String id;
  private String title;
  private String organizerEmail;
  private List<String> participantEmails;

  private List<String> availableDays;
  private String startTime;
  private String endTime;
  private int durationMinutes;

  private Map<String, Integer> participantNecessity; // "email" → 0, 1, 2
  private List<SlotBlock> optimalSlots;
  private Map<String, Map<String, Integer>> submittedPreferences;
  private List<String> rejectedParticipants;
  private List<String> confirmedParticipants;

  public Event() {} // Required by Firestore
}
