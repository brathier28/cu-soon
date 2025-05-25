import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { EventData } from "../types/EventData";

export function useDashboardEvents() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [organizerEvents, setOrganizerEvents] = useState<EventData[]>([]);
  const [participantEvents, setParticipantEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<Error | null>(null); // <- add error state

  useEffect(() => {
    async function fetchEvents() {
      if (!email) return;

      try {
        const encodedEmail = encodeURIComponent(email);
        const res = await fetch(`http://localhost:8080/api/events?email=${encodedEmail}`);

        if (!res.ok) {
          const text = await res.text();
          const err = new Error(`Backend error: ${res.status} - ${text}`);
          console.error(err);
          setError(err);
          return;
        }

        const events: EventData[] = await res.json();
        const normalizedEmail = email.toLowerCase();

        const organizer = events.filter(
          (e) => e.organizerEmail.toLowerCase() === normalizedEmail
        );
        const participant = events.filter(
          (e) => e.organizerEmail.toLowerCase() !== normalizedEmail
        );

        setOrganizerEvents(organizer);
        setParticipantEvents(participant);
        setError(null); // clear previous errors if successful
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    }

    fetchEvents();
  }, [email]);

  return {
    organizerEvents,
    participantEvents,
    setOrganizerEvents,
    setParticipantEvents,
    email,
    error, // <- return the error
  };
}

