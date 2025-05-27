import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";


/**
 * CreateEvent is the first step in the event creation flow.
 * Users provide a title, duration, and participant emails with necessity levels.
 * Upon validation, the form transitions to the date/time selection page.
 */
export default function CreateEvent() {
  const { user } = useUser();
  const navigate = useNavigate();


  // all useState information inputted by user (could be simplified using a useReducer)
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [participantEmails, setParticipantEmails] = useState<string[]>([]);
  const [participantNecessity, setParticipantNecessity] = useState<Record<string, number>>({});
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [newParticipantNecessity, setNewParticipantNecessity] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");


  // Deals with adding new participant to useState
  const handleAddParticipant = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newParticipantEmail) {
      setErrorMessage("Participant email is required.");
      return;
    }

    if (!emailRegex.test(newParticipantEmail)) {
      setErrorMessage("Invalid email format. Please enter a valid email address.");
      return;
    }

    if (![1, 3, 5].includes(newParticipantNecessity)) {
      setErrorMessage("Necessity must be 1, 3, or 5.");
      return;
    }

    if (participantEmails.includes(newParticipantEmail)) {
      setErrorMessage("This participant is already added.");
      return;
    }

    setParticipantEmails((prev) => [...prev, newParticipantEmail]);
    setParticipantNecessity((prev) => ({
      ...prev,
      [newParticipantEmail]: newParticipantNecessity,
    }));

    setNewParticipantEmail("");
    setNewParticipantNecessity(1);
    setErrorMessage("");
  };

  // Ensures that information inputted by user is valid
  const validateForm = () => {
    if (!title.trim()) {
      setErrorMessage("Event title is required.");
      return false;
    }

    if (durationMinutes % 15 !== 0 || durationMinutes <= 0) {
      setErrorMessage("Duration must be a positive multiple of 15.");
      return false;
    }

    if (participantEmails.length === 0) {
      setErrorMessage("At least one participant must be added.");
      return false;
    }

    if (durationMinutes > 1435) {
      setErrorMessage("Duration cannot exceed 1435 minutes (23 hours and 45 minutes).");
      return false;
    }

    return true;
  };

  // Navigates to calendar organizer page to set ranges for event
  const handleNext = () => {
    if (!user) {
      setErrorMessage("User not signed in!");
      return;
    }

    if (!validateForm()) {
      return;
    }

    navigate("/calendar-organizer", {
      state: {
        title,
        durationMinutes,
        participantEmails,
        participantNecessity,
      },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>

      <p className="text-gray-600 mb-20">
        Start by entering a title, the length of your event (in minutes), and inviting participants.
        You'll be able to choose the days and times that work best in the next step. Each participant can be marked as <strong>Not Required</strong>, <strong>Preferred</strong>,
        or <strong>Required</strong> to help with scheduling.
      </p>

      {errorMessage && (
        <div
          className="input-error-message text-red-600 font-medium mb-4"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="event-title">Event Title:</label>
        <input
          id="event-title"
          className="border p-2 block w-full"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="duration">Duration (minutes, multiple of 15):</label>
        <input
          id="duration"
          className="border p-2 block w-full"
          type="number"
          min={15}
          step={15}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
        />
        <small className="text-gray-500">
          Max duration: 1435 minutes (23 hours and 45 minutes). Must be a multiple of 15.
        </small>
      </div>

      <div className="mb-4">
        <label htmlFor="participant-email">Invite Participant:</label>
        <input
          id="participant-email"
          className="border p-2 block w-full mb-2"
          type="email"
          placeholder="Participant Email"
          value={newParticipantEmail}
          onChange={(e) => setNewParticipantEmail(e.target.value)}
        />

        <label htmlFor="necessity-level">Necessity Level:</label>
        <select
          id="necessity-level"
          className="border p-2 block w-full mb-2"
          value={newParticipantNecessity}
          onChange={(e) => setNewParticipantNecessity(Number(e.target.value))}
        >
          <option value={1}>Not Required</option>
          <option value={3}>Preferred</option>
          <option value={5}>Required</option>
        </select>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddParticipant}
          aria-label="Add participant with entered email and selected necessity level"
        >
          Add Participant
        </button>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold">Participants Added:</h2>
        <ul className="list-disc ml-5" aria-label="List of added participants">
          {participantEmails.map((email, index) => (
            <li key={index}>
              {email} (Necessity: {participantNecessity[email]})
            </li>
          ))}
        </ul>
      </div>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded"
        onClick={handleNext}
        aria-label="Proceed to set date and time options for the event"
      >
        Next: Set Date and Time Options
      </button>
    </div>
  );
}

