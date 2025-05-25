package com.browncs._final.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.browncs._final.model.Event;
import com.browncs._final.model.Slot;
import com.browncs._final.model.SlotBlock;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import java.util.*;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * Unit tests for the OptimizationService class, which is responsible for computing the top-ranked
 * consecutive slot blocks based on participant weights and necessity.
 */
public class OptimizationServiceTest {

  private Firestore mockDb;
  private OptimizationService optimizationService;

  @BeforeEach
  public void setUp() {
    mockDb = mock(Firestore.class);
    optimizationService = new OptimizationService();
  }

  /**
   * Helper method that mocks Firestore slot retrieval for a given event ID using a provided list of
   * Slot objects. It sets up the Firestore mock chain: events → document → collection → get() →
   * snapshot → documents.
   */
  private void setupFirestoreMock(List<Slot> slots, String eventId)
      throws ExecutionException, InterruptedException {
    CollectionReference mockEventsCol = mock(CollectionReference.class);
    DocumentReference mockEventDoc = mock(DocumentReference.class);
    CollectionReference mockSlotCol = mock(CollectionReference.class);
    ApiFuture<QuerySnapshot> mockFuture = mock(ApiFuture.class);
    QuerySnapshot mockSnapshot = mock(QuerySnapshot.class);

    List<QueryDocumentSnapshot> docMocks = new ArrayList<>();
    for (Slot s : slots) {
      QueryDocumentSnapshot doc = mock(QueryDocumentSnapshot.class);
      when(doc.toObject(Slot.class)).thenReturn(s);
      when(doc.getId()).thenReturn(s.getId());
      docMocks.add(doc);
    }

    when(mockDb.collection("events")).thenReturn(mockEventsCol);
    when(mockEventsCol.document(eventId)).thenReturn(mockEventDoc);
    when(mockEventDoc.collection("slots")).thenReturn(mockSlotCol);
    when(mockSlotCol.get()).thenReturn(mockFuture);
    when(mockFuture.get()).thenReturn(mockSnapshot);
    when(mockSnapshot.getDocuments()).thenReturn(docMocks);
  }

  /**
   * Tests that computeOptimalSlots correctly forms valid slot blocks, computes their weighted
   * scores using participant necessity, and returns the blocks sorted in descending order of score.
   * Verifies score computation and block ordering.
   */
  @Test
  public void testComputeOptimalSlots_blocksScoredAndSortedCorrectly()
      throws ExecutionException, InterruptedException {
    Event event = new Event();
    event.setDurationMinutes(30);
    event.setParticipantNecessity(Map.of("alice@example.com", 5, "bob@example.com", 3));

    Slot slot1 = new Slot();
    slot1.setId("2025-04-01T10:00");
    slot1.setParticipantWeights(Map.of("alice@example.com", 2)); // 3.0

    Slot slot2 = new Slot();
    slot2.setId("2025-04-01T10:15");
    slot2.setParticipantWeights(Map.of("bob@example.com", 3)); // 1.5

    Slot slot3 = new Slot();
    slot3.setId("2025-04-01T10:30");
    slot3.setParticipantWeights(Map.of("alice@example.com", 1)); // 1.5

    setupFirestoreMock(List.of(slot1, slot2, slot3), "event123");

    try (MockedStatic<FirestoreClient> firestoreClientMock =
        Mockito.mockStatic(FirestoreClient.class)) {
      firestoreClientMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      OptimizationService service = new OptimizationService();
      List<SlotBlock> blocks = service.computeOptimalSlots("event123", event);

      assertEquals(2, blocks.size(), "Expected two valid slot blocks");

      double score1 = blocks.get(0).getTotalScore();
      double score2 = blocks.get(1).getTotalScore();
      assertTrue(score1 >= score2, "Blocks should be sorted by descending score");

      assertEquals(List.of("2025-04-01T10:00", "2025-04-01T10:15"), blocks.get(0).getSlotIds());
      assertEquals(4.5, blocks.get(0).getTotalScore(), 0.001); // 3 + 1.5
    }
  }

  /**
   * Tests that computeOptimalSlots skips blocks that are not made of consecutive 15-minute
   * intervals. Verifies that non-contiguous slot blocks are not included in the results.
   */
  @Test
  public void testComputeOptimalSlots_skipsInvalidGapBlock() throws Exception {
    Event event = new Event();
    event.setDurationMinutes(30);
    event.setParticipantNecessity(Map.of("alice@example.com", 5));

    Slot slot1 = new Slot();
    slot1.setId("2025-04-01T10:00");

    Slot slot2 = new Slot();
    slot2.setId("2025-04-01T10:45"); // gap → not valid

    setupFirestoreMock(List.of(slot1, slot2), "eventY");

    try (MockedStatic<FirestoreClient> firestoreClientMock =
        Mockito.mockStatic(FirestoreClient.class)) {
      firestoreClientMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      OptimizationService service = new OptimizationService();
      List<SlotBlock> blocks = service.computeOptimalSlots("eventY", event);

      assertTrue(blocks.isEmpty(), "No valid blocks should be returned");
    }
  }

  /**
   * Tests that computeOptimalSlots correctly aggregates scores when a single user has multiple
   * weights across consecutive slots in the same block. Ensures scoring logic adds up contributions
   * correctly when the same user appears multiple times.
   */
  @Test
  public void testComputeOptimalSlots_multipleWeightsSameUser()
      throws ExecutionException, InterruptedException {
    Event event = new Event();
    event.setDurationMinutes(30); // 2-slot block
    event.setParticipantNecessity(Map.of("alice@example.com", 5)); // required = 1.5 multiplier

    Slot slot1 = new Slot();
    slot1.setId("2025-04-01T10:00");
    slot1.setParticipantWeights(Map.of("alice@example.com", 2)); // 2 * 1.5 = 3.0

    Slot slot2 = new Slot();
    slot2.setId("2025-04-01T10:15");
    slot2.setParticipantWeights(Map.of("alice@example.com", 3)); // 3 * 1.5 = 4.5

    setupFirestoreMock(List.of(slot1, slot2), "eventX");

    try (MockedStatic<FirestoreClient> firestoreClientMock =
        Mockito.mockStatic(FirestoreClient.class)) {
      firestoreClientMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      OptimizationService service = new OptimizationService();
      List<SlotBlock> blocks = service.computeOptimalSlots("eventX", event);

      assertEquals(1, blocks.size());
      assertEquals(List.of("2025-04-01T10:00", "2025-04-01T10:15"), blocks.get(0).getSlotIds());
      assertEquals(7.5, blocks.get(0).getTotalScore(), 0.001); // 3.0 + 4.5
    }
  }
}
