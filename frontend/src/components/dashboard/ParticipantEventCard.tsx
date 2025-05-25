import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "../../styles/main.css";

interface OrganizerEventCardProps {
  event: any;
  respondToInvitation: (eventId: string, resposnse: "accept" | "reject") => void;
}

export default function ParticipantEventCard(props: OrganizerEventCardProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { event, respondToInvitation } = props;

  const email = user?.primaryEmailAddress?.emailAddress;
  const hasSubmittedAvailability = !!event.submittedPreferences?.[email];
  const hasAccepted = event.confirmedParticipants?.includes(email);
  const hasRejected = event.rejectedParticipants?.includes(email);

  if (!user || !user.primaryEmailAddress) {
    return <p>Loading user...</p>;
  }

  const handleClick = () => {
    if (event?.id) {
      if (!hasSubmittedAvailability) {
        navigate(`/event/${event.id}/input-availability`);
      } else {
        navigate(`/event/${event.id}/home-page`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    respondToInvitation(event.id, "reject");
  };

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    respondToInvitation(event.id, "accept");
  };

  if (!event?.title) return null;

  if (!hasAccepted && !hasRejected) {
    return (
      <div
        className="card event-card"
        role="region"
        aria-label={`Invitation to event: ${event.title}`}
      >
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <button
          onClick={handleRejectClick}
          className="delete-button"
          aria-label={`Reject invitation to event titled ${event.title}`}
        >
          Reject Invitation
        </button>
        <button
          onClick={handleAcceptClick}
          className="delete-button"
          aria-label={`Accept invitation to event titled ${event.title}`}
        >
          Accept Invitation
        </button>
      </div>
    );
  }

  if (hasAccepted) {
    return (
      <div
        className="card event-card"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`You accepted the invitation to ${event.title}. Click to enter or edit availability.`}
      >
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p>You have accepted this invitation. Click to enter or edit availability.</p>
      </div>
    );
  }

  return null;
}
