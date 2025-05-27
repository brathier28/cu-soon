import React, { useState, useEffect } from "react";
import { useEventById } from "../../hooks/useEventByID";
import "../../styles/main.css";
import AvailabilityCalendar from "./AvailabilityCalendar";



/**
 * OptimizeCalendarSection fetches and renders the availability calendar
 * for a given event. It pulls the event and associated preference data
 * from the backend, formats it, and passes it to AvailabilityCalendar.
 */
const OptimizeCalendarSection: React.FC<{ eventId: string }> = ({
  eventId,
}) => {
  const { event, error, loading } = useEventById(eventId);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [preferencesLoading, setPreferencesLoading] = useState<boolean>(true);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  // Fetch preferences from backend API
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!eventId) return;

      try {
        setPreferencesLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/events/${eventId}/get-preferences`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch preferences: ${response.status}`);
        }

        const data = await response.json();
        setPreferences(data);
        setPreferencesError(null);
      } catch (err) {
        console.error("Error fetching preferences:", err);
        setPreferencesError("Failed to load availability data");
      } finally {
        setPreferencesLoading(false);
      }
    };

    fetchPreferences();
  }, [eventId]);

   // Handle loading and error states
  if (loading || preferencesLoading) return <div>Loading...</div>;
  if (error || !event) return <div>Error loading event.</div>;
  if (preferencesError) return <div>{preferencesError}</div>;

  // Get participants
  const participants = event.participantEmails.map((email, index) => ({
    id: index + 1,
    name: email,
    responded: Boolean(event.submittedPreferences?.[email]),
  }));

  // Parse date range
  const dateStrings = event.availableDays;
  const startDate = new Date(dateStrings[0] + "T12:00:00");
  const endDate = new Date(dateStrings[dateStrings.length - 1] + "T12:00:00");

  // Parse time range
  const startTime = parseInt(event.startTime.split(":")[0]);
  const endTime = parseInt(event.endTime.split(":")[0]);

  return (
    <div className="calendar-container">
      <AvailabilityCalendar
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        participants={participants}
        preferencesData={preferences}
      />
    </div>
  );
};

export default OptimizeCalendarSection;
