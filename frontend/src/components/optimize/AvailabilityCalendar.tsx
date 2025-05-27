import React, { useState } from "react";
import "../../styles/main.css";


/**
 * TimeSlot defines the structure for each availability entry.
 * Each slot contains an ID, date, time, and a map of participant weights (preferences).
 */
interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  participantWeights: Record<string, number>;
}

/**
 * Props for AvailabilityCalendar.
 * - `startDate`, `endDate`: Date range to display
 * - `startTime`, `endTime`: Time bounds for each day (24-hour format)
 * - `participants`: List of participants and their response status
 * - `preferencesData`: Submitted preferences per time slot
 */
interface AvailabilityCalendarProps {
  startDate: Date;
  endDate: Date;
  startTime: number;
  endTime: number;
  participants: { id: number; name: string; responded: boolean }[];
  preferencesData: TimeSlot[];
}

/**
 * AvailabilityCalendar displays a grid of time slots across multiple days,
 * visualizing participant availability and preferences for scheduling.
 * Users can click a time cell to see participant-level detail for that slot.
 */
export default function AvailabilityCalendar({
  startDate,
  endDate,
  startTime,
  endTime,
  participants,
  preferencesData,
}: AvailabilityCalendarProps) {
  const [showPreferenceDetails, setShowPreferenceDetails] =
    useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate array of dates in the range
  const getDatesInRange = () => {
    const dateArray = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  // Generate array of time slots (15-minute increments)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = startTime; hour <= endTime; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({ hour, minute });
      }
    }
    return slots;
  };

  // Formats a date into YYYY-MM-DD for internal comparison.
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Formats time for display in 12-hour AM/PM format.
  const formatTimeDisplay = (hour: number, minute: number) => {
    const isPM = hour >= 12;
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  };

  // Find preferences for a specific time slot
  const getSlotPreferences = (date: Date, hour: number, minute: number) => {
    const formattedDate = formatDate(date);
    const formattedHour = String(hour).padStart(2, "0");
    const formattedMinute = String(minute).padStart(2, "0");
    const formattedTime = `${formattedHour}:${formattedMinute}`;

    return preferencesData.find(
      (slot) => slot.date === formattedDate && slot.startTime === formattedTime
    );
  };

  // Calculate the preference score for a time slot (sum of all weights)
  const getPreferenceScore = (date: Date, hour: number, minute: number) => {
    const slot = getSlotPreferences(date, hour, minute);
    if (!slot || !slot.participantWeights) return 0;

    return Object.values(slot.participantWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
  };

  // Count participants by preference level for a time slot
  const getParticipantCountsByPreference = (
    date: Date,
    hour: number,
    minute: number
  ) => {
    const slot = getSlotPreferences(date, hour, minute);
    if (!slot || !slot.participantWeights) {
      return { "5": 0, "3": 0, "1": 0, total: 0 };
    }

    const counts = { "5": 0, "3": 0, "1": 0, total: 0 };
    Object.values(slot.participantWeights).forEach((weight) => {
      if (weight === 5) counts["5"]++;
      else if (weight === 3) counts["3"]++;
      else if (weight === 1) counts["1"]++;
      counts.total++;
    });

    return counts;
  };

  // Get CSS class based on preference levels
  const getPreferenceClass = (date: Date, hour: number, minute: number) => {
    const counts = getParticipantCountsByPreference(date, hour, minute);
    const totalRespondents = participants.filter((p) => p.responded).length;

    if (counts.total === 0 || totalRespondents === 0) {
      return "availability-none";
    }

    // Calculate weighted score (prioritizing higher preferences)
    // 5's are weighted much higher than 3's, which are weighted higher than 1's
    const weightedScore =
      (counts["5"] * 10 + counts["3"] * 3 + counts["1"]) / totalRespondents;

    if (weightedScore >= 8) return "availability-high";
    if (weightedScore >= 5) return "availability-medium-high";
    if (weightedScore >= 3) return "availability-medium";
    if (weightedScore >= 1) return "availability-medium-low";
    return "availability-low";
  };

  // Get slot ID for a specific time
  const getSlotId = (date: Date, hour: number, minute: number) => {
    const formattedDate = formatDate(date);
    const formattedTime = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;
    return `${formattedDate}T${formattedTime}`;
  };

  // Handle click on a time slot
  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const slotId = getSlotId(date, hour, minute);
    setSelectedSlot((prevSlot) => (prevSlot === slotId ? null : slotId));
    setShowPreferenceDetails(true);
  };

  // Format participant preference indicator
  const formatPreferenceIndicator = (weight: number) => {
    if (weight === 5) return "★★★"; // Preferred
    if (weight === 3) return "★★"; // Available
    if (weight === 1) return "★"; // If necessary
    return "";
  };

  const dates = getDatesInRange();
  const timeSlots = getTimeSlots();

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Availability Calendar</h2>

      <div className="calendar-scroll-container">
        <div className="calendar-inner">
          {/* Calendar Header with Days */}
          <div className="calendar-header">
            <div className="time-label-spacer"></div>
            {dates.map((date) => (
              <div key={formatDate(date)} className="date-header">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
                <br />
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            ))}
          </div>

          {/* Calendar Body - Time Slots and Availability Grid */}
          <div className="calendar-body">
            {timeSlots.map(({ hour, minute }) => (
              <div key={`${hour}-${minute}`} className="time-row">
                <div className="time-label">
                  {minute === 0 && (
                    <div className="hour-label">
                      {formatTimeDisplay(hour, minute)}
                    </div>
                  )}
                </div>

                {dates.map((date) => {
                  const slotId = getSlotId(date, hour, minute);
                  const isSelected = selectedSlot === slotId;

                  return (
                    <div
                      key={`${formatDate(date)}-${hour}-${minute}`}
                      className={`availability-cell ${getPreferenceClass(
                        date,
                        hour,
                        minute
                      )} ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSlotClick(date, hour, minute)}
                    >
                      {/* Removed the counts display here for cleaner design */}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preference Details Panel */}
      {showPreferenceDetails && selectedSlot && (
        <div className="preference-details-panel">
          <h3>
            {selectedSlot.replace("T", " ")}
            <button
              className="close-button"
              onClick={() => setSelectedSlot(null)}
            >
              ×
            </button>
          </h3>
          <div className="participant-list">
            {(() => {
              const [dateStr, timeStr] = selectedSlot.split("T");
              const [hourStr, minuteStr] = timeStr.split(":");
              const slotDate = new Date(dateStr + "T12:00:00");
              const hour = parseInt(hourStr);
              const minute = parseInt(minuteStr);

              const slot = getSlotPreferences(slotDate, hour, minute);

              if (!slot || Object.keys(slot.participantWeights).length === 0) {
                return <p>No participants available at this time.</p>;
              }

              return (
                <ul>
                  {Object.entries(slot.participantWeights).map(
                    ([email, weight]) => (
                      <li key={email}>
                        <span className="participant-email">{email}</span>
                        <span className={`preference-indicator pref-${weight}`}>
                          {formatPreferenceIndicator(weight)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              );
            })()}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="legend-container">
        <div className="legend-section">
          <span>Availability:</span>
          <div className="legend-item">
            <div className="legend-color availability-none"></div>
            <span>None</span>
          </div>
          <div className="legend-item">
            <div className="legend-color availability-low"></div>
            <span>Low</span>
          </div>
          <div className="legend-item">
            <div className="legend-color availability-medium"></div>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color availability-high"></div>
            <span>High</span>
          </div>
        </div>

        <div className="legend-section">
          <span>Preference Levels:</span>
          <div className="legend-item">
            <span className="preference-indicator pref-5">★★★</span>
            <span>Preferred (5)</span>
          </div>
          <div className="legend-item">
            <span className="preference-indicator pref-3">★★</span>
            <span>Available (3)</span>
          </div>
          <div className="legend-item">
            <span className="preference-indicator pref-1">★</span>
            <span>If necessary (1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
