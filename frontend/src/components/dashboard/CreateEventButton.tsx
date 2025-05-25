import { Link } from "react-router-dom";

export default function CreateEventButton() {
  return (
    <div className="mb-6">
      <Link
        to="/create-event"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 inline-block text-center"
        role="button"
        aria-label="Create a new event"
        tabIndex={0}
      >
        + Create New Event
      </Link>
    </div>
  );
}
