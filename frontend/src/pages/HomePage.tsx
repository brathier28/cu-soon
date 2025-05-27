import { useNavigate } from "react-router-dom";
import "../styles/pages/homepage.css";

/**
 * HomePage serves as the landing page for the CU Soon application.
 * It provides basic branding and navigation options to the dashboard and about pages.
 */
export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <h1>CU Soon</h1>
      <p>A smarter way to schedule events together.</p>

      <div className="nav-buttons">
        <button
          onClick={() => navigate("/dashboard")}
          aria-label="Navigate to your event dashboard"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate("/about")}
          aria-label="Learn more about CU Soon on the About page"
        >
          About
        </button>
      </div>
    </div>
  );
}
