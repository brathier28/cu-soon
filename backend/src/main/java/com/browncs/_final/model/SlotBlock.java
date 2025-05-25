package com.browncs._final.model;

import java.util.List;
import lombok.Data;

@Data
public class SlotBlock {
  private List<String> slotIds;
  private double totalScore;
}
