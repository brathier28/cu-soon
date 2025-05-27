import React from 'react';
import { useNavigate } from "react-router-dom";


/**
 * Represents a participant and whether they’ve submitted their availability.
 */
interface Participant {
  name: string;
  hasSubmitted: boolean;
}


/**
 * OptimizeParticipantList displays a list of all participants for an event,
 * indicating whether each person has submitted their availability.
 * It also includes a navigation button to allow the current user to edit their own availability.
 */
const OptimizeParticipantList: React.FC<{ participants: Participant[]; eventID: string }> = ({
  participants,
  eventID,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-1/2 pr-4">
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(`/event/${eventID}/input-availability`)}
          aria-label="Edit your availability for this event"
        >
          Edit Your Availability
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Participants:</h2>
      <ul className="space-y-4" aria-label="List of participants and their availability status">
        {participants.map((participant, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-blue-100 border p-4 rounded shadow-sm"
            role="group"
            aria-label={`${participant.name}, availability ${participant.hasSubmitted ? 'submitted' : 'not submitted'}`}
          >
            <span>{participant.name}</span>
            <span aria-label={participant.hasSubmitted ? 'Availability submitted' : 'Availability not submitted'}>
              {participant.hasSubmitted ? "✔️" : "❌"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptimizeParticipantList;
