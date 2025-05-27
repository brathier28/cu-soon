package com.browncs._final.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Data;

/**
 * Payload model for participant availability submissions. Encapsulates their rankings for specific
 * timespans and any removed entries.
 */
@Data
public class PreferenceRequest {

  private String userEmail;

  /**
   * Availability rankings by timespan ID (e.g., "10:00-10:30@2025-05-01"). Value indicates
   * preference level (1 = if necessary, 3 = available, 5 = preferred).
   */
  private Map<String, Integer> rankings; // timespan → 0–3

  private List<String> deletedTimespanIds;

  /**
   * Safe getter for deletedTimespanIds — returns an empty list if null. Helps avoid null pointer
   * exceptions during iteration.
   */
  public List<String> getDeletedTimespanIds() {
    return deletedTimespanIds != null ? deletedTimespanIds : new ArrayList<>();
  }
}
