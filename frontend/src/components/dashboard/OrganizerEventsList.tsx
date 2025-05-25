import OrganizerEventCard from "./OrganizerEventCard";
import "../../styles/main.css";

interface OrganizerEventsListProps {
  events: any[];
  onDelete: (eventId: string) => void;
}

export default function OrganizerEventsList(props: OrganizerEventsListProps) {
  const { events, onDelete } = props;

  return (
    <div
      className="flex-container gap-4"
      role="region"
      aria-label="List of events you've organized"
    >
      <ul className="flex-container gap-4">
        {events.map((event) => (
          <li key={event.id} role="listitem">
            <OrganizerEventCard event={event} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  );
}
