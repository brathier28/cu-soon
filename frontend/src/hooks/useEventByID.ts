import { useEffect, useState } from "react";


export interface EventData {
  id: string;
  title: string;
  organizerEmail: string;
  participantEmails: string[];
  availableDays: string[];
  startTime: string;
  endTime: string;
  rejectedParticipants: string[]
  confirmedParticipants?: string[]
  durationMinutes: number;
  optimalSlots?: SlotBlock[];
  participantNecessity: Record<string, number>;
  // other fields like dates, times, etc...
  submittedPreferences?: {
    [email: string]: {
      [timespan: string]: number;
    };
  };

}

// Supporting SlotBlock interface 
export interface SlotBlock {
  slotIds: string[];
  totalScore: number;
}

export function useEventById(eventId: string | undefined) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log()

  useEffect(() => {
    console.log("inhook1");
    if (!eventId) return;

    const load = async () => {
      try {
        console.log("inhook2");
        const res = await fetch(`http://localhost:8080/api/events/${eventId}`);
        console.log("inhook after await");
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
        console.log("inHook:",data);
        setError(null);
      } catch (err) {
        console.log("Failed to load event", err);
        setError("Failed to load event");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  return { event, loading, error };
}
