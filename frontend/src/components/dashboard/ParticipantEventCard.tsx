import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "../../styles/main.css";

/**
 * Props for the ParticipantEventCard component.
 * - `event`: An object representing the event.
 * - `respondToInvitation`: Callback to handle accept/reject responses to invitations.
 */
interface OrganizerEventCardProps {
  event: any;
  respondToInvitation: (eventId: string, resposnse: "accept" | "reject") => void;
}

/**
 * ParticipantEventCard displays a card representing an event that a participant
 * has been invited to. It conditionally renders actions based on whether the user
 * has accepted or rejected the invitation, or submitted availability.
 */
export default function ParticipantEventCard(props: OrganizerEventCardProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { event, respondToInvitation } = props;

  const email = user?.primaryEmailAddress?.emailAddress;
  const hasSubmittedAvailability = !!event.submittedPreferences?.[email];
  const hasAccepted = event.confirmedParticipants?.includes(email);
  const hasRejected = event.rejectedParticipants?.includes(email);

  // Display loading state while user information is being fetched
  if (!user || !user.primaryEmailAddress) {
    return <p>Loading user...</p>;
  }

  
  
  // Navigates user based on whether they have already submitted availability.
  const handleClick = () => {
    if (event?.id) {
      if (!hasSubmittedAvailability) {
        navigate(`/event/${event.id}/input-availability`);
      } else {
        navigate(`/event/${event.id}/home-page`);
      }
    }
  };

  // Supports keyboard accessibility by allowing Enter or Space to trigger navigation.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // Handles rejection of an event invitation and prevents event bubbling.
  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    respondToInvitation(event.id, "reject");
  };

  // Handles acceptance of an event invitation and prevents event bubbling.
  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    respondToInvitation(event.id, "accept");
  };

  // Do not render the card if the event has no title
  if (!event?.title) return null;

  // Render invitation prompt if the user has not yet responded
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

  // Render interactive card if the user has accepted the invitation
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

  // No render if the user has rejected the event
  return null;
}
