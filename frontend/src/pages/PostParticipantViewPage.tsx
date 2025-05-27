import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useEventById } from "../hooks/useEventByID";
import { useParams } from "react-router-dom";

/**
 * Represents a user's selected availability time block for a specific day,
 * with associated preference level.
 */
interface TimeRange {
  start: string;
  end: string;
  preference: number;
  day: string;
}


/**
 * PostParticipantViewPage is a confirmation page shown after a participant
 * submits their availability. It displays their selections and allows editing.
 */
export default function PostParticipantViewPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, loading, error } = useEventById(eventId);
  const [userPreferences, setUserPreferences] = useState<TimeRange[]>([]);

  // On load, extract and parse the current user's submitted preferences into TimeRange
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (event && email) {
      const submittedPrefs = event.submittedPreferences?.[email];
      if (submittedPrefs) {
        const formattedPrefs: TimeRange[] = Object.entries(submittedPrefs).map(
          ([timespanID, preference]) => {
            const [timeRange, day] = timespanID.split("@");
            const [start, end] = timeRange.split("-");
            return { day, start, end, preference };
          }
        );
        setUserPreferences(formattedPrefs);
      }
    }
  }, [event, user]);

  if (loading) return <p>Loading...</p>;
  if (!event || error) return <p>Failed to load event.</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;

  // Converts a 24-hour time string (e.g. "14:00") into a user-friendly time format (e.g. "2:00 PM").
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Thank you for submitting your preferences for {event.title}
      </h1>

      <h2 className="text-xl font-semibold mb-4">
        Here are your preferences:
      </h2>

      {userPreferences.length === 0 ? (
        <p className="text-gray-500" role="status">
          No preferences submitted.
        </p>
      ) : (
        <ul
          className="space-y-4"
          aria-label="List of time slots you submitted as preferences"
        >
          {userPreferences.map((pref, index) => {
            const formattedDate = new Date(pref.day).toLocaleDateString(
              undefined,
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <li
                key={index}
                className="bg-gray-100 border p-4 rounded shadow-sm"
              >
                {formattedDate} from {formatTime(pref.start)} –{" "}
                {formatTime(pref.end)}{" "}
                <span className="text-sm text-gray-600">
                  (
                  {pref.preference === 5
                    ? "Preferred"
                    : pref.preference === 3
                    ? "Available"
                    : "If necessary"}
                  )
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => navigate(`/event/${event.id}/input-availability`)}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          aria-label="Edit your submitted availability for this event"
        >
          Edit Availability
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          aria-label="Return to your event dashboard"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
