package com.browncs._final.model;

import java.util.List;
import lombok.Data;

/**
 * Represents a contiguous block of time slots proposed as an optimal meeting time. Computed during
 * optimization based on participant preferences and necessity scores.
 */
@Data
public class SlotBlock {
  // List of consecutive slotIDs
  private List<String> slotIds;
  // Aggregated score for this block
  private double totalScore;
}
