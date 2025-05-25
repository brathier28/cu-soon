package com.browncs._final.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class PreferenceRequest {
  private String userEmail;
  private Map<String, Integer> rankings; // timespan → 0–3
  private List<String> deletedTimespanIds;

  public List<String> getDeletedTimespanIds() {
    return deletedTimespanIds != null ? deletedTimespanIds : new ArrayList<>();
  }
}
