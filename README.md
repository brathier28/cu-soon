# CU Soon - Final Project

# Project Details
Created by Lily Young, Max Smith-Stern, Nick Kitahata, and Brendan Rathier
github: 

U

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


# How to: 

## Run Program

## Interactive with CU SO

## Run Tests

# Collaboration
ChatGPT. We used ChatGPT to assist in creating a plan/layout for pin organization & persistence, as well as with CSS help. 