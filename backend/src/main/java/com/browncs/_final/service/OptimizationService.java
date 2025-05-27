package com.browncs._final.service;

import com.browncs._final.model.Event;
import com.browncs._final.model.Slot;
import com.browncs._final.model.SlotBlock;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Service;

/**
 * Service responsible for computing and saving optimal time blocks for an event based on
 * participant availability, preferences, and necessity levels.
 */
@Service
public class OptimizationService {

  private static final DateTimeFormatter formatter =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

  /**
   * Runs the optimization algorithm and saves the top 5 scoring time blocks to the given event's
   * Firestore document.
   *
   * @param eventId ID of the event to optimize
   * @return List of the top 5 optimal SlotBlocks
   * @throws ExecutionException If Firestore access fails
   * @throws InterruptedException If Firestore access is interrupted
   */
  public List<SlotBlock> optimizeAndSave(String eventId)
      throws ExecutionException, InterruptedException {
    Firestore db = FirestoreClient.getFirestore();

    return db.runTransaction(
            transaction -> {
              DocumentReference eventRef = db.collection("events").document(eventId);
              DocumentSnapshot snapshot = transaction.get(eventRef).get();
              if (!snapshot.exists()) {
                throw new IllegalArgumentException("Event not found: " + eventId);
              }

              Event event = snapshot.toObject(Event.class);

              // Compute optimal slots
              List<SlotBlock> computedBlocks = computeOptimalSlots(eventId, event);

              // Update optimalSlots field
              event.setOptimalSlots(computedBlocks);
              transaction.set(eventRef, event);

              return computedBlocks;
            })
        .get();
  }

  /**
   * Computes the top 5 scoring time blocks of consecutive slots based on participant slot
   * preferences.
   *
   * @param eventId The ID of the event
   * @param event The event object containing duration and necessity mappings
   * @return List of optimal SlotBlock objects
   * @throws ExecutionException If Firestore access fails
   * @throws InterruptedException If Firestore access is interrupted
   */
  public List<SlotBlock> computeOptimalSlots(String eventId, Event event)
      throws ExecutionException, InterruptedException {

    Firestore db = FirestoreClient.getFirestore();

    // 1. Load all slots
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

    int blockSize = event.getDurationMinutes() / 15; // e.g., 60 min event = 4 slots
    Map<String, Integer> necessity = event.getParticipantNecessity();

    List<SlotBlock> results = new ArrayList<>();

    // 2. Try every valid block of N consecutive slots
    for (int i = 0; i <= slots.size() - blockSize; i++) {
      List<Slot> block = slots.subList(i, i + blockSize);
      if (!isValidBlock(block)) continue;

      double score = computeBlockScore(block, necessity);
      SlotBlock slotBlock = new SlotBlock();
      slotBlock.setSlotIds(block.stream().map(Slot::getId).toList());
      slotBlock.setTotalScore(score);
      results.add(slotBlock);
    }

    // 3. Sort and return top 5
    return results.stream()
        .sorted((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()))
        .limit(5)
        .toList();
  }

  /**
   * Validates whether a block of slots are consecutive 15-minute intervals.
   *
   * @param block List of Slot objects to validate
   * @return true if the slots form a valid block, false otherwise
   */
  private boolean isValidBlock(List<Slot> block) {
    for (int j = 0; j < block.size() - 1; j++) {
      LocalDateTime t1 = parse(block.get(j).getId());
      LocalDateTime t2 = parse(block.get(j + 1).getId());
      if (!Duration.between(t1, t2).equals(Duration.ofMinutes(15))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Parses a slot ID (formatted as ISO datetime) into a LocalDateTime.
   *
   * @param slotId ID of the slot (e.g., "2025-04-29T17:00")
   * @return LocalDateTime object
   */
  private LocalDateTime parse(String slotId) {
    return LocalDateTime.parse(slotId, formatter);
  }

  /**
   * Computes a weighted score for a block of slots based on participant preferences for each slot
   * and their assigned necessity levels.
   *
   * @param block The list of slots forming a valid block
   * @param necessity Map from participant email to importance level (3 = optional, 5 = required)
   * @return The total score of the block
   */
  private double computeBlockScore(List<Slot> block, Map<String, Integer> necessity) {
    double total = 0.0;

    for (Slot slot : block) {
      Map<String, Integer> weights = slot.getParticipantWeights();
      if (weights == null) continue;

      for (Map.Entry<String, Integer> entry : weights.entrySet()) {
        String email = entry.getKey();
        int weight = entry.getValue();
        int importance = necessity.getOrDefault(email, 1); // default "preferred"

        double factor =
            switch (importance) {
              case 5 -> 1.5; // required
              case 3 -> 0.5; // optional
              default -> 1.0; // preferred
            };

        total += weight * factor;
      }
    }
    return total;
  }
}
