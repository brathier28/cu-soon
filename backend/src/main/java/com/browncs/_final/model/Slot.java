package com.browncs._final.model;

import java.util.Map;
import lombok.Data;

/**
 * Represents a 15-minute availability time slot for an event on a specific day. Each slot tracks
 * which participants are available and how strongly they prefer it.
 */
@Data
public class Slot {
  private String id; // "2025-04-28T09:00"
  private String date; // YYYY-MM-DD format
  private String startTime;
  private Map<String, Integer> participantWeights; // email → weight
}
