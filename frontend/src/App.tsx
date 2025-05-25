import { initializeApp } from "firebase/app";
import "./styles/main.css";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ParticipantViewPage from "./pages/ParticipantViewPage";
import PostParticipantViewPage from "./pages/PostParticipantViewPage";
import CreateEvent from "./pages/CreateEventPage";
import CalendarOrganizer from "./pages/CalendarOrganizerPage";
import OptimizePage from "./pages/OptimizePage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

initializeApp(firebaseConfig);

export default function App() {
  return (
    <div className="App">
      {/* If signed out, show login */}
      <SignedOut>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Welcome to CU soon</h1>
          <SignInButton mode="modal" />
        </div>
      </SignedOut>

      {/* If signed in, show routes and navigation */}
      <SignedIn>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Top Bar */}
            <div className="flex justify-end gap-4 p-4 bg-gray-100 border-b">
              <UserButton />
              <SignOutButton />
            </div>

            {/* Main App Routes */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route
                path="/calendar-organizer"
                element={<CalendarOrganizer />}
              />
              <Route
                path="/event/:eventId/input-availability"
                element={<ParticipantViewPage />}
              />
              <Route
                path="/event/:eventId/home-page"
                element={<PostParticipantViewPage />}
              />
              <Route path="/event/:eventId" element={<OptimizePage />} />
            </Routes>
          </div>
        </Router>
      </SignedIn>
    </div>
  );
}
