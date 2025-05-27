import { useNavigate } from "react-router-dom";
import "../styles/pages/about.css";
import meetingImage from "../assets/meeting.jpg"; 


/**
 * AboutPage is a static informational page describing the CU Soon platform.
 * It highlights the core value proposition and includes a branded image with caption.
 */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <h1>About CU Soon</h1>
      <p>
        CU Soon helps groups find the best time to meet by collecting
        participant availability and computing the most optimal time slots.
        Scheduling has never been so straightforward!
      </p>

      <figure className="about-image-container">
        <img
          src={meetingImage}
          alt="A team gathered around a table during a CU Soon corporate retreat"
          className="about-image"
        />
        <figcaption className="about-caption">
          A snapshot from our recent corporate retreat — where ideas and canes
          flowed freely.
        </figcaption>
      </figure>

      <button onClick={() => navigate("/")} aria-label="Go back to the home page">
        Back to Home
      </button>
    </div>
  );
}
