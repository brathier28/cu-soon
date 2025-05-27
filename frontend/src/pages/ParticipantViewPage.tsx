import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "../styles/main.css";
import { useNavigate } from "react-router-dom";
import { useEventById } from "../hooks/useEventByID";

/**
 * A single time range entry associated with a preference level.
 */
interface TimeRange {
  start: string;
  end: string;
  preference: number;
}

/**
 * ParticipantViewPage allows participants to input, edit, and submit their availability
 * for an event, including specifying preference levels for each time block.
 */
export default function ParticipantViewPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, loading, error } = useEventById(eventId);

  const [availability, setAvailability] = useState<Record<string, TimeRange[]>>({});
  const [currentDay, setCurrentDay] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [preference, setPreference] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (event && user?.primaryEmailAddress?.emailAddress) {
      const submittedPrefs =
        event.submittedPreferences?.[user.primaryEmailAddress.emailAddress];
      if (submittedPrefs) {
        const newAvailability: Record<string, TimeRange[]> = {};

        Object.entries(submittedPrefs).forEach(([timespanID, preference]) => {
          const [timeRange, day] = timespanID.split("@");
          const [start, end] = timeRange.split("-");
          if (!newAvailability[day]) newAvailability[day] = [];
          newAvailability[day].push({ start, end, preference: Number(preference) });
        });

        for (const day in newAvailability) {
          newAvailability[day].sort((a, b) => a.start.localeCompare(b.start));
        }

        setAvailability(newAvailability);
      }

      if (Array.isArray(event.availableDays) && event.availableDays.length > 0) {
        setCurrentDay(event.availableDays[0]);
      }
    }
  }, [event, user]);

  if (loading) return <p>Loading...</p>;
  if (!event || error) return <p>Failed to load event.</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;

  // Checks if user input is in designated range
  const isInRange = (start: string, end: string) =>
    event.startTime <= start && end <= event.endTime && start < end;

  // Checks if user input is a multiple of 15
  const isMultipleOf15 = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return minutes % 15 === 0;
  };

  // Checks if there is an overlap in times selected by user
  const isOverlapping = (day: string, start: string, end: string) => {
    const existing = availability[day] || [];
    return existing.some(({ start: s, end: e }) => start < e && end > s);
  };


  // Adds time to list 
  const handleAddTime = () => {
    if (!isInRange(startTime, endTime)) {
      setErrorMessage(
        `Time must be between ${event.startTime} and ${event.endTime}, and start before end.`
      );
      return;
    }
    if (!isMultipleOf15(startTime) || !isMultipleOf15(endTime)) {
      setErrorMessage("Times must be on 15-minute intervals (e.g., 10:00, 10:15).");
      return;
    }
    if (isOverlapping(currentDay, startTime, endTime)) {
      setErrorMessage("This time range overlaps with an existing availability.");
      return;
    }

    const timespanID = `${startTime}-${endTime}@${currentDay}`;
    setDeletedIds((prev) => {
      const updated = new Set(prev);
      updated.delete(timespanID);
      return updated;
    });

    setAvailability((prev) => ({
      ...prev,
      [currentDay]: [...(prev[currentDay] || []), { start: startTime, end: endTime, preference }]
        .sort((a, b) => a.start.localeCompare(b.start)),
    }));

    setStartTime("");
    setEndTime("");
    setPreference(3);
    setErrorMessage("");
  };

  // Deletes time from list
  const handleDeleteTime = (day: string, index: number) => {
    const range = availability[day]?.[index];
    if (range) {
      const timespanID = `${range.start}-${range.end}@${day}`;
      setDeletedIds((prev) => new Set(prev).add(timespanID));
    }

    setAvailability((prev) => {
      const updated = [...(prev[day] || [])];
      updated.splice(index, 1);
      if (updated.length === 0) {
        const { [day]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [day]: updated.sort((a, b) => a.start.localeCompare(b.start)) };
    });
  };

  // Submits all availability time ranges (with preferences) to the backend
  const handleSubmitAvailability = async () => {
    if (!user || !user.primaryEmailAddress) {
      setErrorMessage("User not signed in!");
      return;
    }

    const email = user.primaryEmailAddress.emailAddress;
    const availabilityMap: Record<string, number> = {};

    for (const [day, times] of Object.entries(availability)) {
      times.forEach(({ start, end, preference }) => {
        const timespanID = `${start}-${end}@${day}`;
        availabilityMap[timespanID] = preference;
      });
    }

    const payload = {
      userEmail: email,
      rankings: availabilityMap,
      deletedTimespanIds: Array.from(deletedIds),
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/events/${eventId}/submit-preferences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Submission failed");

      setDeletedIds(new Set());
      if (email === event.organizerEmail) {
        navigate(`/event/${eventId}`);
      } else {
        navigate(`/event/${eventId}/home-page`);
      }
    } catch (error) {
      console.error("Failed to submit availability:", error);
      setErrorMessage("Submission failed. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate("/dashboard")} aria-label="Back to Dashboard">
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">Enter Your Availability</h1>

      <p className="text-gray-600 mb-6 text-sm">
        Use the form below to enter when you're available on each of the days selected by the event organizer.
        Time ranges must be within <strong>{event.startTime}</strong> to <strong>{event.endTime}</strong> and in
        <strong> 15-minute increments</strong> (e.g., 10:00–10:30).
        <br />
        You can also set a preference level:
        <strong className="ml-1">Preferred</strong>, <strong>Available</strong>, or <strong>Only if necessary</strong>.
      </p>

      <div className="mb-4">
        <label htmlFor="day-select" className="block font-medium mb-1">Select Day:</label>
        <select
          id="day-select"
          className="border p-2 w-full"
          value={currentDay}
          onChange={(e) => setCurrentDay(e.target.value)}
        >
          {event.availableDays.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-2 text-sm text-gray-600">
        Please enter time ranges between <strong>{event.startTime}</strong> and <strong>{event.endTime}</strong> (on 15-minute intervals)
      </p>

      <div className="flex gap-4 mb-2 items-center flex-wrap">
        <label htmlFor="start-time">Start Time:</label>
        <input
          id="start-time"
          type="time"
          className="border p-2"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <label htmlFor="end-time">End Time:</label>
        <input
          id="end-time"
          type="time"
          className="border p-2"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <label htmlFor="preference-select">Preference:</label>
        <select
          id="preference-select"
          className="border p-2"
          value={preference}
          onChange={(e) => setPreference(Number(e.target.value))}
        >
          <option value={5}>Preferred</option>
          <option value={3}>Available</option>
          <option value={1}>Only if necessary</option>
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAddTime}
          aria-label="Add selected time range to your availability"
        >
          Add Time
        </button>
      </div>

      {errorMessage && (
        <p className="input-error-message text-red-600 mt-2" role="alert" aria-live="assertive">
          {errorMessage}
        </p>
      )}

      <h2 className="font-semibold mb-2 mt-4">Your Availability:</h2>
      <div aria-label="Your availability by date">
        {Object.entries(availability)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([day, times]) => (
            <div key={day} className="mb-6">
              <p className="font-medium text-lg mb-2">{day}</p>
              <ul className="space-y-2">
                {times.map((range, idx) => (
                  <li
                    key={idx}
                    className="flex flex-wrap items-center gap-6 bg-gray-800 p-3 rounded"
                  >
                    <span>
                      {range.start} – {range.end}{" "}
                      <span className="text-sm text-gray-400">
                        ({range.preference === 5 ? "Preferred" : range.preference === 3 ? "Available" : "If necessary"})
                      </span>
                    </span>
                    <button
                      className="ml-4 text-red-400 hover:text-red-600 text-sm"
                      onClick={() => handleDeleteTime(day, idx)}
                      aria-label={`Delete time range from ${range.start} to ${range.end} on ${day}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <button
        className="bg-green-600 text-white px-6 py-2 mt-4 rounded"
        onClick={handleSubmitAvailability}
        aria-label="Submit all selected availability times"
      >
        Submit Availability
      </button>
    </div>
  );
}
