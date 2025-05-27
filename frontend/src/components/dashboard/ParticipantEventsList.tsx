import ParticipantEventCard from "./ParticipantEventCard";

/**
 * Props for the ParticipantEventsList component.
 * - `events`: An array of event objects the user has been invited to.
 * - `respondToInvitation`: Callback to handle participant responses (accept/reject).
 */
interface ParticipantEventsListProps {
  events: any[];
  respondToInvitation: (eventId: string, resposnse: "accept" | "reject") => void;
}

/**
 * ParticipantEventsList renders a list of events that the current user
 * has been invited to, each displayed as a ParticipantEventCard.
 * Includes accessibility attributes and consistent layout styling.
 */
export default function ParticipantEventsList(props: ParticipantEventsListProps) {
  const { events, respondToInvitation } = props;

  return (
    <div
      className="flex-container gap-4"
      role="region"
      aria-label="List of events you've been invited to"
    >
      <ul className="flex-container gap-4">
        {events.map((event) => (
          <li key={event.id} role="listitem">
            <ParticipantEventCard
              event={event}
              respondToInvitation={respondToInvitation}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
