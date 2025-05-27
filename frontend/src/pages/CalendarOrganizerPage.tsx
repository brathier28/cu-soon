import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "../styles/main.css";


/**
 * CalendarOrganizer allows an organizer to select available days and a common
 * time range for an event. It performs validation and submits event details
 * to the backend. Relies on state passed via route navigation.
 */
function CalendarOrganizer() {
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    title: string;
    durationMinutes: number;
    participantEmails: string[];
    participantNecessity: Record<string, number>;
  };

  // State to track selected dates and time ranges
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startRange, setStartRange] = useState("09:00");
  const [endRange, setEndRange] = useState("21:00");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!state || !state.title || !state.participantEmails || !state.durationMinutes) {
      navigate("/event-setup"); // redirect if accessed without setup
    }
  }, [state, navigate]);

  // handles day selection/deselection in calendar UI
  const handleDayClick = (value: Date) => {
    const alreadySelected = selectedDates.some(
      (date) => date.toDateString() === value.toDateString()
    );

    if (alreadySelected) {
      setSelectedDates((prevDates) =>
        prevDates.filter((date) => date.toDateString() !== value.toDateString())
      );
    } else {
      setSelectedDates((prevDates) => [...prevDates, value]);
    }
  };

  // highlights selected days in calendar 
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      if (
        selectedDates.find(
          (selectedDate) => selectedDate.toDateString() === date.toDateString()
        )
      ) {
        return "selected-day";
      }
    }
    return null;
  };

  // calculates duration between two time strings (splits)
  const getRangeDurationInMinutes = (start: string, end: string): number => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  };

  // Creates event object using inputted information, handles error & sends to backend
  const handleCreateEvent = async () => {
    if (!user) {
      setErrorMessage("User not signed in!");
      return;
    }

    const organizerEmail = user.primaryEmailAddress?.emailAddress;
    if (!organizerEmail) {
      setErrorMessage("Could not determine organizer email.");
      return;
    }

    if (selectedDates.length === 0) {
      setErrorMessage("You must select at least one possible day for the event.");
      return;
    }

    const allowedTimes = /^([01]\d|2[0-3]):(00|15|30|45)$/;

    if (!allowedTimes.test(startRange) || !allowedTimes.test(endRange)) {
      setErrorMessage("Time must be in 15-minute increments (e.g., 09:00, 13:45).");
      return;
    }

    const rangeMinutes = getRangeDurationInMinutes(startRange, endRange);
    if (rangeMinutes < state.durationMinutes) {
      setErrorMessage(
        `Time range must be at least the event duration (${state.durationMinutes} minutes).`
      );
      return;
    }


     // Construct event payload to send to backend
    const eventData = {
      title: state.title,
      participantEmails: state.participantEmails,
      durationMinutes: state.durationMinutes,
      participantNecessity: state.participantNecessity,
      availableDays: selectedDates.map((date) => date.toISOString().split("T")[0]),
      startTime: startRange,
      endTime: endRange,
    };

    console.log("Submitting event:", eventData);
    

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${encodeURIComponent(organizerEmail)}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const createdText = await response.text(); 
      const createdId = createdText.split(": ")[1]; 
      navigate(`/event/${createdId}/input-availability`);

    } catch (error) {
      console.error("Failed to create event:", error);
      setErrorMessage("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>Set Event Availability</h1>
      </div>

      <div className="main-content">
        {errorMessage && (
          <p className="error-message text-red-600" aria-live="assertive">
            {errorMessage}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="calendar" className="font-bold"><strong>Select Possible Days:</strong></label>
          <small className="text-sm text-gray-500 mb-2">
            Select one or more future dates when you are available. You can click a day again to
            remove it from the selection. Past dates cannot be selected.
          </small>
          <Calendar
            id="calendar"
            onClickDay={handleDayClick}
            tileClassName={tileClassName}
            tileDisabled={({ date }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            aria-label="Calendar to select available days"
          />
        </div>

        <div className="form-group">
          <label htmlFor="startRange">Possible Availability Range (same for all days):</label>
          <div className="time-range mb-2">
            <label htmlFor="startRange">Start:</label>
            <input
              id="startRange"
              type="time"
              min="00:00"
              max="23:45"
              step="900"
              value={startRange}
              onChange={(e) => setStartRange(e.target.value)}
              aria-label="Start of availability range"
            />
            <label htmlFor="endRange">End:</label>
            <input
              id="endRange"
              type="time"
              min="00:00"
              max="23:45"
              step="900"
              value={endRange}
              onChange={(e) => setEndRange(e.target.value)}
              aria-label="End of availability range"
            />
          </div>
          <small className="text-sm text-gray-500">
            Select a time range between <strong>12:00 AM</strong> and <strong>11:45 PM</strong> using{" "}
            <strong>15-minute increments</strong>. This range must be at least the event duration (
            {state.durationMinutes} minutes).
          </small>
      
        </div>

        <button
          className="create-button mt-4"
          onClick={handleCreateEvent}
          aria-label="Create event and continue"
        >
          Create Event
        </button>
      </div>
    </div>
  );
}

export default CalendarOrganizer;
