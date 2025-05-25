import ParticipantEventCard from "./ParticipantEventCard";

interface ParticipantEventsListProps {
  events: any[];
  respondToInvitation: (eventId: string, resposnse: "accept" | "reject") => void;
}

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


