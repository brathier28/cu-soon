package com.browncs._final.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.browncs._final.model.Event;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

  @Mock private Firestore mockDb;
  @Mock private EmailService mockEmailService;
  @Mock private CollectionReference mockEventsCollection;
  @Mock private DocumentReference mockEventDoc;
  @Mock private Transaction mockTransaction;
  @Mock private CollectionReference mockSlotsCollection;
  @Mock private ApiFuture<QuerySnapshot> mockSlotsFuture;
  @Mock private QuerySnapshot mockSlotsSnapshot;
  @Mock private QueryDocumentSnapshot mockSlotDoc1;
  @Mock private QueryDocumentSnapshot mockSlotDoc2;
  @Mock private DocumentReference mockSlotRef1;
  @Mock private DocumentReference mockSlotRef2;
  @Mock private ApiFuture<DocumentSnapshot> mockEventSnapshotFuture;
  @Mock private DocumentSnapshot mockEventSnapshot;
  @Mock private DocumentReference mockUserDoc;

  private EventService eventService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    lenient().when(mockDb.collection("events")).thenReturn(mockEventsCollection);
    lenient().when(mockEventsCollection.document()).thenReturn(mockEventDoc);
    lenient().when(mockEventDoc.getId()).thenReturn("test-event-id");

    eventService = new EventService(mockDb, mockEmailService);
  }

  /**
   * Tests that an event is successfully created using a Firestore transaction, and that all
   * participants receive email invitations. Verifies the generated event ID and that both email
   * sends are triggered.
   *
   * @throws Exception if the mocked transaction fails
   */
  @Test
  void testCreateEvent_success() throws Exception {
    Event event = new Event();
    event.setTitle("Mock Event");
    event.setOrganizerEmail("org@example.com");
    event.setParticipantEmails(List.of("a@example.com", "b@example.com"));

    when(mockDb.collection("events")).thenReturn(mockEventsCollection);
    when(mockEventsCollection.document()).thenReturn(mockEventDoc);
    when(mockEventDoc.getId()).thenReturn("test-event-id");

    @SuppressWarnings("unchecked")
    ApiFuture<Void> mockFuture = (ApiFuture<Void>) mock(ApiFuture.class);
    when(mockFuture.get()).thenReturn(null);

    @SuppressWarnings("unchecked")
    ApiFuture<?> castedFuture = (ApiFuture<?>) mockFuture;
    when(mockDb.runTransaction(any())).thenReturn((ApiFuture<Object>) castedFuture);

    eventService = new EventService(mockDb, mockEmailService);

    String resultId = eventService.createEvent(event);

    assertEquals("test-event-id", resultId);
    verify(mockEmailService).sendEventInvite("a@example.com", "Mock Event");
    verify(mockEmailService).sendEventInvite("b@example.com", "Mock Event");
  }

  /**
   * Tests that when the Firestore transaction fails during event creation, an exception is thrown
   * and no invitation emails are sent.
   *
   * @throws Exception when transaction fails
   */
  @Test
  void testCreateEvent_throwsException() throws Exception {
    // Arrange
    Event event = new Event();
    event.setTitle("Mock Event");
    event.setOrganizerEmail("org@example.com");
    event.setParticipantEmails(List.of("a@example.com"));

    when(mockDb.collection("events")).thenReturn(mockEventsCollection);
    when(mockEventsCollection.document()).thenReturn(mockEventDoc);
    when(mockEventDoc.getId()).thenReturn("fail-id");

    @SuppressWarnings("unchecked")
    ApiFuture<Object> failedFuture = (ApiFuture<Object>) mock(ApiFuture.class);
    when(failedFuture.get()).thenThrow(new ExecutionException("fail", null));
    when(mockDb.runTransaction(any())).thenReturn(failedFuture);

    // Act & Assert
    assertThrows(ExecutionException.class, () -> eventService.createEvent(event));
    verify(mockEmailService, never()).sendEventInvite(any(), any());
  }

  /**
   * Tests that the getEventsForEmail method returns events where the user is either the organizer
   * or a participant. Verifies that two events are returned and that both roles are captured in the
   * result.
   *
   * @throws Exception if query execution fails
   */
  @Test
  void testGetEventsForEmail_returnSuccess() throws Exception {
    String email = "test@example.com";

    // Mocks
    CollectionReference mockCollection = mock(CollectionReference.class);
    Query mockQuery = mock(Query.class);
    ApiFuture<QuerySnapshot> mockFuture = mock(ApiFuture.class);
    QuerySnapshot mockSnapshot = mock(QuerySnapshot.class);

    QueryDocumentSnapshot mockOrganizerDoc = mock(QueryDocumentSnapshot.class);
    QueryDocumentSnapshot mockParticipantDoc = mock(QueryDocumentSnapshot.class);

    Event organizerEvent = new Event();
    organizerEvent.setTitle("Organizer Event");
    organizerEvent.setOrganizerEmail(email); // match via organizerEmail
    organizerEvent.setId("organizer-id");

    Event participantEvent = new Event();
    participantEvent.setTitle("Participant Event");
    participantEvent.setParticipantEmails(List.of(email)); // match via participantEmails
    participantEvent.setId("participant-id");

    // Chain mocks
    when(mockDb.collection("events")).thenReturn(mockCollection);
    when(mockCollection.where(any(Filter.class))).thenReturn(mockQuery);
    when(mockQuery.get()).thenReturn(mockFuture);
    when(mockFuture.get()).thenReturn(mockSnapshot);
    when(mockSnapshot.getDocuments()).thenReturn(List.of(mockOrganizerDoc, mockParticipantDoc));

    when(mockOrganizerDoc.toObject(Event.class)).thenReturn(organizerEvent);
    when(mockOrganizerDoc.getId()).thenReturn("organizer-id");

    when(mockParticipantDoc.toObject(Event.class)).thenReturn(participantEvent);
    when(mockParticipantDoc.getId()).thenReturn("participant-id");

    // Act
    List<Event> events = eventService.getEventsForEmail(email);

    // Assert
    assertEquals(2, events.size());
    assertTrue(events.stream().anyMatch(e -> e.getTitle().equals("Organizer Event")));
    assertTrue(events.stream().anyMatch(e -> e.getTitle().equals("Participant Event")));
  }

  /**
   * Tests that deleteEventById successfully removes the event document, all associated slots, and
   * updates the organizer and participant user records. Verifies that deletes and transaction
   * commit occur without throwing.
   *
   * @throws Exception if transaction fails
   */
  @Test
  void testDeleteEventById_success() throws Exception {
    String eventId = "event-123";
    String organizerEmail = "organizer@example.com";
    List<String> participants = List.of("a@example.com", "b@example.com");

    Event mockEvent = new Event();
    mockEvent.setId(eventId);
    mockEvent.setOrganizerEmail(organizerEmail);
    mockEvent.setParticipantEmails(participants);

    // Slot structure
    DocumentReference mockEventDoc = mock(DocumentReference.class);
    CollectionReference mockSlotsCollection = mock(CollectionReference.class);
    ApiFuture<QuerySnapshot> mockSlotsFuture = mock(ApiFuture.class);
    QuerySnapshot mockSlotsSnapshot = mock(QuerySnapshot.class);
    QueryDocumentSnapshot mockSlotDoc1 = mock(QueryDocumentSnapshot.class);
    QueryDocumentSnapshot mockSlotDoc2 = mock(QueryDocumentSnapshot.class);
    DocumentReference mockSlotRef1 = mock(DocumentReference.class);
    DocumentReference mockSlotRef2 = mock(DocumentReference.class);

    // Event snapshot
    DocumentSnapshot mockEventSnapshot = mock(DocumentSnapshot.class);
    ApiFuture<DocumentSnapshot> mockEventSnapshotFuture = mock(ApiFuture.class);

    // Mock structure
    when(mockDb.collection("events")).thenReturn(mockEventsCollection);
    when(mockEventsCollection.document(eventId)).thenReturn(mockEventDoc);
    when(mockEventDoc.collection("slots")).thenReturn(mockSlotsCollection);
    when(mockSlotsCollection.get()).thenReturn(mockSlotsFuture);
    when(mockSlotsFuture.get()).thenReturn(mockSlotsSnapshot);
    when(mockSlotsSnapshot.getDocuments()).thenReturn(List.of(mockSlotDoc1, mockSlotDoc2));
    when(mockSlotDoc1.getReference()).thenReturn(mockSlotRef1);
    when(mockSlotDoc2.getReference()).thenReturn(mockSlotRef2);

    // Mock transaction
    @SuppressWarnings("unchecked")
    ApiFuture<Void> mockTransactionFuture = mock(ApiFuture.class);
    when(mockTransactionFuture.get()).thenReturn(null);
    when(mockDb.runTransaction(any()))
        .thenReturn((ApiFuture<Object>) (ApiFuture<?>) mockTransactionFuture);

    // Act & Assert
    assertDoesNotThrow(() -> eventService.deleteEventById(eventId));
    verify(mockSlotRef1).delete();
    verify(mockSlotRef2).delete();
    verify(mockDb).runTransaction(any());
  }

  /**
   * Tests that loadEventById correctly retrieves an event by ID, sets the ID field on the returned
   * Event object, and handles deserialization from the Firestore snapshot.
   *
   * @throws Exception if Firestore call fails
   */
  @Test
  void testLoadEventById_success() throws Exception {
    String eventId = "event-456";

    // Arrange
    DocumentReference mockDocRef = mock(DocumentReference.class);
    ApiFuture<DocumentSnapshot> mockFuture = mock(ApiFuture.class);
    DocumentSnapshot mockSnapshot = mock(DocumentSnapshot.class);

    Event mockEvent = new Event();
    mockEvent.setTitle("Sample Event");

    // Set up mocks
    when(mockDb.collection("events")).thenReturn(mockEventsCollection);
    when(mockEventsCollection.document(eventId)).thenReturn(mockDocRef);
    when(mockDocRef.get()).thenReturn(mockFuture);
    when(mockFuture.get()).thenReturn(mockSnapshot);
    when(mockSnapshot.exists()).thenReturn(true);
    when(mockSnapshot.toObject(Event.class)).thenReturn(mockEvent);
    when(mockSnapshot.getId()).thenReturn(eventId);

    // Act
    Event result = eventService.loadEventById(eventId);

    // Assert
    assertNotNull(result);
    assertEquals("Sample Event", result.getTitle());
    assertEquals(eventId, result.getId());
  }
}
