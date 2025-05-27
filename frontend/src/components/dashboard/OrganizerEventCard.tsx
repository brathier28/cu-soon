import { useNavigate } from "react-router-dom";
import "../../styles/main.css";

/**
 * Props for the OrganizerEventCard component.
 * - `event`: An object representing the event to display.
 * - `onDelete`: Callback triggered when the user clicks the delete button.
 */
interface OrganizerEventCardProps {
  event: any;
  onDelete: (eventId: string) => void;
}

/**
 * OrganizerEventCard is a clickable card component used by organizers
 * to view or delete their scheduled events.
 * It supports keyboard interaction and includes accessible labels.
 */
export default function OrganizerEventCard(props: OrganizerEventCardProps) {
  const navigate = useNavigate();
  const { event, onDelete } = props;

  
  // Navigates to the event detail page when the card is clicked.
  const handleCardClick = () => {
    if (event?.id) {
      navigate(`/event/${event.id}`);
    }
  };

  // Enables keyboard accessibility: Enter or Space triggers navigation.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  
  
  // Handles delete button click without triggering card navigation.
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDelete(event.id);
  };

  // Don't render anything if the event has no title
  if (!event?.title) return null;

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="card event-card"
      aria-label={`View details for event titled ${event.title}`}
    >
      <h3>{event.title}</h3>

      <button
        onClick={handleDeleteClick}
        className="delete-button"
        aria-label={`Delete event titled ${event.title}`}
      >
        Delete Event
      </button>
    </div>
  );
}
