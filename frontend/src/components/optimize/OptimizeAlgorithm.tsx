import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


/**
 * Represents an optimized time block returned from the backend.
 * - `slotIds`: Array of time slot strings (ISO format).
 * - `totalScore`: Numeric value representing the quality of the time block.
 */
interface OptimizedTime {
  slotIds: string[];
  totalScore: number;
}

// Formats a full date-time string into a human-readable format.
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};



/// Formats a start and end time into a user-friendly time range string.
const formatTimeRange = (startStr: string, endStr: string) => {
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startFormatted = formatDateTime(startStr);
  const endFormatted = sameDay
    ? new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(endDate)
    : formatDateTime(endStr);

  return `${startFormatted} – ${endFormatted}`;
};

/**
 * OptimizeAlgorithm is a component that fetches and displays the top-ranked
 * time slots based on an optimization algorithm that accounts for participant
 * availability and priority weights.
 */
const OptimizeAlgorithm: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [optimizedTimes, setOptimizedTimes] = useState<OptimizedTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Calls the backend API to retrieve optimized time slots for the given event.
  const fetchOptimizedTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/events/${eventId}/optimize`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error: ${res.status} - ${text}`);
      }
      const data: OptimizedTime[] = await res.json();
      setOptimizedTimes(data);
    } catch (err) {
      setError("Failed to fetch optimized times.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="optimize-algorithm mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold mr-2">Optimized Times:</h2>
        <button
          onClick={() => setShowPopup(!showPopup)}
          className="text-sm bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center font-bold hover:bg-gray-400"
          title="What is this?"
        >
          ?
        </button>
      </div>

      {showPopup && (
        <div className="bg-white border border-gray-300 p-4 rounded shadow-md mb-4 max-w-md text-sm">
          <p>
            {/* Replace this with your explanation */}
            This algorithm finds the best meeting times by combining everyone's
            availability and the importance of their attendance. To find a
            score, it multiplies a user’s availability weight by their
            attendance importance, then sums these scores across all users to
            recommend the best time blocks.
          </p>
          <div className="text-right">
            <button
              onClick={() => setShowPopup(false)}
              className="text-blue-600 mt-2 hover:underline text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="optimized-times bg-gray-100 p-4 rounded shadow-sm mb-4 grid grid-cols-1 gap-4">
        {optimizedTimes.map((time, index) => {
          const start = time.slotIds[0];
          const end = new Date(
            new Date(time.slotIds[time.slotIds.length - 1]).getTime() +
              15 * 60 * 1000
          ).toISOString();

          return (
            <div
              key={index}
              className="time-card p-4 bg-white rounded shadow-md"
            >
              <h3 className="text-lg font-bold mb-2">Ranking: {index + 1}</h3>
              <p className="mb-1">Time: {formatTimeRange(start, end)}</p>
              <p>Score: {time.totalScore}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={fetchOptimizedTimes}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Optimize
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default OptimizeAlgorithm;