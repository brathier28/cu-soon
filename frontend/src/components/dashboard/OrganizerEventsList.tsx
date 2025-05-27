import OrganizerEventCard from "./OrganizerEventCard";
import "../../styles/main.css";

/**
 * Props for the OrganizerEventsList component.
 * - `events`: An array of event objects to display.
 * - `onDelete`: Callback to delete an event by ID.
 */
interface OrganizerEventsListProps {
  events: any[];
  onDelete: (eventId: string) => void;
}

/**
 * OrganizerEventsList renders a list of event cards for the organizer.
 * Each event is wrapped in a list item and passed to OrganizerEventCard.
 */
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
