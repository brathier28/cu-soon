import { useDashboardEvents } from "../hooks/useDashboardEvents";
import OrganizerEventsList from "../components/dashboard/OrganizerEventsList";
import ParticipantEventsList from "../components/dashboard/ParticipantEventsList";
import CreateEventButton from "../components/dashboard/CreateEventButton";
import { useNavigate } from "react-router-dom";
import { EventData } from "../types/EventData";


/**
 * Dashboard displays a summary view of the user's events:
 * - Events the user is organizing
 * - Events the user is participating in
 * 
 * Users can delete events, respond to invitations, or navigate to create new events.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    organizerEvents,
    participantEvents,
    setOrganizerEvents,
    setParticipantEvents,
    email,
    error,
  } = useDashboardEvents();


  // Deals with deleting event that user created as an organizer
  const handleDelete = (eventId: string) => {
    fetch(`http://localhost:8080/api/delete/${eventId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete event");
        setOrganizerEvents((prev) => prev.filter((e) => e.id !== eventId));
      })
      .catch(console.error);
  };

  // deals with responding to events you were invited to as partiicpant
  const respondToInvitation = (eventId: string, status: "accept" | "reject") => {
    fetch(
      `http://localhost:8080/api/events/${eventId}/respond?userEmail=${encodeURIComponent(
        email
      )}&status=${status}`,
      { method: "POST" }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to ${status} invitation`);

        if (status === "reject") {
          setParticipantEvents((prev) => prev.filter((e) => e.id !== eventId));
        } else {
          setParticipantEvents((prev: EventData[]) =>
            prev.map((e) => {
              if (e.id !== eventId) return e;
              const updatedConfirmed = (e.confirmedParticipants ?? []).concat(email);
              return { ...e, confirmedParticipants: updatedConfirmed };
            })
          );
        }
      })
      .catch(console.error);
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate("/")} aria-label="Return to the home page">
        Back to Home
      </button>

      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Welcome to your dashboard. From here, you can manage events you've created or respond to invitations from others.
        Use the buttons and lists below to view details, adjust preferences, or create new events.
      </p>

      <CreateEventButton />

      <section
        className="mb-8 mt-6"
        aria-labelledby="organizer-events-heading"
      >
        <h2 id="organizer-events-heading" className="text-xl font-semibold mb-2">
          Events You're Organizing
        </h2>
        <OrganizerEventsList events={organizerEvents} onDelete={handleDelete} />
      </section>

      <section aria-labelledby="participant-events-heading">
        <h2 id="participant-events-heading" className="text-xl font-semibold mb-2">
          Events You're Participating In
        </h2>
        <ParticipantEventsList
          events={participantEvents}
          respondToInvitation={respondToInvitation}
        />
      </section>
    </div>
  );
}
