import { useNavigate } from "react-router-dom";
import "../../styles/main.css";

interface OrganizerEventCardProps {
  event: any;
  onDelete: (eventId: string) => void;
}

export default function OrganizerEventCard(props: OrganizerEventCardProps) {
  const navigate = useNavigate();
  const { event, onDelete } = props;

  const handleCardClick = () => {
    if (event?.id) {
      navigate(`/event/${event.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
  };

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
