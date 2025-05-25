package com.browncs._final.model;

import java.util.Map;
import lombok.Data;

@Data
public class Slot {
  private String id; // "2025-04-28T09:00"
  private String date;
  private String startTime;
  private Map<String, Integer> participantWeights; // email → weight
}
