package com.browncs._final.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.browncs._final.model.Event;
import com.browncs._final.model.PreferenceRequest;
import com.browncs._final.model.Slot;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import java.util.*;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

/**
 * Unit tests for the SlotService class, which handles slot generation, preference submission, and
 * preference retrieval for events.
 */
public class SlotServiceTest {

  private final Firestore mockDb = mock(Firestore.class);

  /**
   * Tests that the generateSlots method correctly creates 15-minute slot intervals for a single day
   * based on the provided start and end time. Verifies that exactly 4 slots are created for a
   * 1-hour window (09:00–10:00), and that each slot is saved.
   */
  @Test
  void testGenerateSlots_createsCorrectSlotIds() {
    Firestore mockDb = mock(Firestore.class);
    CollectionReference mockEventsCol = mock(CollectionReference.class);
    DocumentReference mockEventDoc = mock(DocumentReference.class);
    CollectionReference mockSlotsCol = mock(CollectionReference.class);
    DocumentReference mockSlotDoc = mock(DocumentReference.class); // used for all .set() calls

    when(mockDb.collection("events")).thenReturn(mockEventsCol);
    when(mockEventsCol.document("event123")).thenReturn(mockEventDoc);
    when(mockEventDoc.collection("slots")).thenReturn(mockSlotsCol);
    when(mockSlotsCol.document(anyString())).thenReturn(mockSlotDoc);

    try (MockedStatic<FirestoreClient> firestoreMock = Mockito.mockStatic(FirestoreClient.class)) {
      firestoreMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      SlotService slotService = new SlotService();

      Event event = new Event();
      event.setAvailableDays(List.of("2025-05-15"));
      event.setStartTime("09:00");
      event.setEndTime("10:00");

      assertDoesNotThrow(() -> slotService.generateSlots("event123", event));

      // verifies that 4 slots will be created here!
      verify(mockSlotsCol, times(4)).document(anyString());
      verify(mockSlotDoc, times(4)).set(any(Slot.class));
    }
  }

  /**
   * Tests that the submitPreferences method correctly handles both deletions and additions of slot
   * preferences for a user. Verifies that the proper participantWeights are updated (or removed) in
   * the relevant slot documents, and that the event's submittedPreferences field is updated
   * accordingly.
   */
  @Test
  void testSubmitPreferences_addsAndDeletesCorrectly() {
    CollectionReference mockEventsCol = mock(CollectionReference.class);
    DocumentReference mockEventDoc = mock(DocumentReference.class);
    CollectionReference mockSlots = mock(CollectionReference.class);
    DocumentReference mockSlot1 = mock(DocumentReference.class);
    DocumentReference mockSlot2 = mock(DocumentReference.class);

    when(mockDb.collection("events")).thenReturn(mockEventsCol);
    when(mockEventsCol.document("eventABC")).thenReturn(mockEventDoc);
    when(mockEventDoc.collection("slots")).thenReturn(mockSlots);
    when(mockSlots.document("2025-05-15T17:00")).thenReturn(mockSlot1);
    when(mockSlots.document("2025-05-15T17:15")).thenReturn(mockSlot2);

    try (MockedStatic<FirestoreClient> firestoreMock = Mockito.mockStatic(FirestoreClient.class)) {
      firestoreMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      SlotService slotService = new SlotService();

      PreferenceRequest req = new PreferenceRequest();
      req.setUserEmail("a@example.com");
      req.setDeletedTimespanIds(List.of("17:00-17:30@2025-05-15"));
      req.setRankings(Map.of("17:00-17:30@2025-05-15", 2));

      slotService.submitPreferences("eventABC", req);

      verify(mockSlot1)
          .update(FieldPath.of("participantWeights", "a@example.com"), FieldValue.delete());
      verify(mockSlot2)
          .update(FieldPath.of("participantWeights", "a@example.com"), FieldValue.delete());
      verify(mockSlot1).update(FieldPath.of("participantWeights", "a@example.com"), 2);
      verify(mockSlot2).update(FieldPath.of("participantWeights", "a@example.com"), 2);
      verify(mockEventDoc)
          .update(FieldPath.of("submittedPreferences", "a@example.com"), req.getRankings());
    }
  }

  /**
   * Tests that the getPreferences method correctly retrieves and sorts all slot documents for a
   * given event. Verifies that slot IDs are ordered chronologically based on their timestamps, and
   * that each slot is properly converted from Firestore.
   */
  @Test
  void testGetPreferences_sortsAndReturns() throws ExecutionException, InterruptedException {
    CollectionReference mockEventsCol = mock(CollectionReference.class);
    DocumentReference mockEventDoc = mock(DocumentReference.class);
    CollectionReference mockSlotsCol = mock(CollectionReference.class);
    ApiFuture<QuerySnapshot> mockFuture = mock(ApiFuture.class);
    QuerySnapshot mockSnapshot = mock(QuerySnapshot.class);
    QueryDocumentSnapshot doc1 = mock(QueryDocumentSnapshot.class);
    QueryDocumentSnapshot doc2 = mock(QueryDocumentSnapshot.class);

    Slot s1 = new Slot();
    s1.setId("2025-05-15T10:00");
    Slot s2 = new Slot();
    s2.setId("2025-05-15T09:00");

    when(doc1.toObject(Slot.class)).thenReturn(s1);
    when(doc1.getId()).thenReturn(s1.getId());
    when(doc2.toObject(Slot.class)).thenReturn(s2);
    when(doc2.getId()).thenReturn(s2.getId());

    when(mockDb.collection("events")).thenReturn(mockEventsCol);
    when(mockEventsCol.document("eventXYZ")).thenReturn(mockEventDoc);
    when(mockEventDoc.collection("slots")).thenReturn(mockSlotsCol);
    when(mockSlotsCol.get()).thenReturn(mockFuture);
    when(mockFuture.get()).thenReturn(mockSnapshot);
    when(mockSnapshot.getDocuments()).thenReturn(List.of(doc1, doc2));

    try (MockedStatic<FirestoreClient> firestoreMock = Mockito.mockStatic(FirestoreClient.class)) {
      firestoreMock.when(FirestoreClient::getFirestore).thenReturn(mockDb);

      SlotService slotService = new SlotService();
      List<Slot> results = slotService.getPreferences("eventXYZ");

      assertEquals(2, results.size());
      assertEquals("2025-05-15T09:00", results.get(0).getId());
      assertEquals("2025-05-15T10:00", results.get(1).getId());
    }
  }
}
