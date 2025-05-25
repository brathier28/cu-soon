# CU Soon - Final Project

# Project Details
Created by Lily Young, Max Smith-Stern, Nick Kitahata, and Brendan Rathier
github: 

THis 

# Design Choices

## Backend

## Frontend

We used Firestore as our backend storage system, which was organized into two collections: users and events. These collections tied events to a set of data-- the organizer, the participants and their score, the possible dates and time ranges, the eventID, and the list of participants who had submitted availability. The events collection was also where we stored the possible slots for the event. The backend handles parsing large chunks of availability from participants into 15 minute slot objects, which the algorithm assigns a weighted score based on three factors: the amount of participants available, the attendance importance of the participants, and whether the participants prefer the time, are only available, or are only available if necessary. On the frontend, many of our design choices rested on how we were going to package information to the backend, and putting together and accounting for the various situations 



# Errors/Bugs
There are certain things we might include


# Tests
### **Test Cases and Coverage**

- **Setup (before each test)**
  - Adds a spoofed user cookie.
  - Clears previous user data.
  - Sets up Clerk authentication.
  - Navigates to the app homepage.
  - Ensures the sign-in button is visible.
  - Signs in the test user.
  - Confirms the map view is loaded.

---

- **Test: "On page load, I see the map and add a pin that is visible"**
  - Ensures the map is visible on page load.
  - Clicks on a location in the map to add a pin.
  - Verifies the pin appears with the correct color (`rgb(0, 0, 255)`).

---

- **Test: "On page load, I add a pin and still see it after reloading the page"**
  - Ensures the map is visible.
  - Adds a pin and verifies its visibility and color.
  - Reloads the page.
  - Ensures the pin is still present after reload.

---

- **Test: "Pins still visible after sign out and sign in same user"**
  - Adds a pin and verifies it appears.
  - Signs out the user.
  - Ensures the sign-in button appears.
  - Signs back in with the same user.
  - Verifies the previously placed pin is still present.

---

- **Test: "Pins from one user still visible after sign in from a different user"**
  - Adds a pin as User 1 and verifies its color (`rgb(0, 0, 255)`).
  - Signs out User 1.
  - Signs in as User 2.
  - Ensures the pin from User 1 is still visible but has a different color (`rgb(255, 0, 0)`).

---

- **Test: "Add two pins and then remove them, making sure that they both disappear"**
  - Adds two pins at different locations and verifies their visibility.
  - Clicks the "Clear My Pins" button.
  - Ensures both pins are removed.

---

- **Test: "Pins still cleared after reload"**
  - Adds four pins at different locations.
  - Clears all pins and verifies they are gone.
  - Reloads the page.
  - Ensures all pins remain cleared after reload.

---

- **Test: "Checks that clear pins only clears the current user pins"**
  - User 1 adds a pin.
  - Signs out and switches to User 2.
  - User 2 verifies User 1's pin is still visible.
  - User 2 adds their own pin.
  - User 2 clears their pins.
  - Ensures User 1's pin remains but User 2's pin is removed.

# How to: 

## Run Program

## Interactive with CU SO

## Run Tests

# Collaboration
ChatGPT. We used ChatGPT to assist in creating a plan/layout for pin organization & persistence, as well as with CSS help. 