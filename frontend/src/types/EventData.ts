import { SlotBlock } from "../hooks/useEventByID";

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