import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEventById } from '../hooks/useEventByID';
import OptimizeParticipantList from '../components/optimize/OptimizeParticipantList';
import OptimizeCalendarSection from '../components/optimize/OptimizeCalendarSection';
import OptimizeAlgorithm from '../components/optimize/OptimizeAlgorithm';
import "../styles/main.css";

interface Participant {
  name: string;
  hasSubmitted: boolean;
}

// Main OptimizePage Component
const OptimizePage: React.FC = () => {
  const { eventId } = useParams();
  const { event, loading, error } = useEventById(eventId);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (event) {
      const participantList = event.participantEmails.map((email: string) => ({
        name: email,
        hasSubmitted: !!event.submittedPreferences?.[email],
      }));
      setParticipants(participantList);
    }
  }, [event]);

  if (loading) return <p>Loading...</p>;
  if (!event || error || !eventId) return <p>Failed to load event. OptimizePage</p>;

  return (
    <div className="p-8 flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">{event.title}</h1>

      <div className="flex flex-1">
        <OptimizeParticipantList participants={participants} eventID= {event.id} />
        <OptimizeCalendarSection eventId={eventId} />
      </div>
      <OptimizeAlgorithm eventId={eventId} />
    </div>
  );
};

export default OptimizePage; 