// Mock user data that mimics real Firestore shape
export const mockUserData = {
    email: "alice@gmail.com",
    eventsOrganized: ["eventId1", "eventId3"],
    eventsParticipating: ["eventId2", "eventId3"],
  };
  

  /* 
    This method mocks event information structure from firestore 
   */
  export const mockEventsData: Record<string, any> = {
    eventId1: {
      id: "eventId1",
      title: "Group Meeting",
      organizerEmail: "alice@gmail.com",
      participantEmails: ["bob@gmail.com", "charlie@gmail.com"],
      status: "pending",
    },
    eventId2: {
      id: "eventId2",
      title: "Mock Trial Debrief",
      organizerEmail: "someoneelse@gmail.com",
      participantEmails: ["alice@gmail.com"],
      status: "ranked",
    },
    eventId3: {
      id: "eventId3",
      title: "Project Check-In",
      organizerEmail: "alice@gmail.com",
      participantEmails: ["bob@gmail.com"],
      status: "finalized",
    },
  };
  