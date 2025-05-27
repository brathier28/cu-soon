import { Link } from "react-router-dom";

/**
 * CreateEventButton is a reusable UI component that renders a styled
 * link functioning as a button, which navigates users to the event creation page.
 *
 * This component promotes accessibility and consistent styling across the app.
 */
export default function CreateEventButton() {
  return (
    <div className="mb-6">
      {/* 
        Link styled as a button to navigate to the event creation route.
        Includes ARIA attributes and tabindex for accessibility.
      */}
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
