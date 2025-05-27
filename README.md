# CU Soon
CU Soon is a collaborative scheduling platform that helps organizers find the best time to meet based on participant availability and preferences. The platform supports event creation, participant polling, and backend optimization for selecting optimal meeting slots.

## Inspiration
The idea for CU Soon was inspired by our own frustrations with existing scheduling tools. Many platforms either require organizers to sift through raw availability data or remove user agency by over-automating the decision process. CU Soon strikes a balance between structure and flexibility: it provides optimized time suggestions, but ultimately allows the organizer to make the final call.

## Features
- User authentication with Clerk
- Custom event creation with support for multiple days and duration constraints
- Availability input via preference ranking on 15-minute intervals
- Backend optimization of time slots using participant necessity weights
- Email notifications powered by SendGrid
- Real-time synchronization using Firebase Firestore
- Distinct views for organizers and participants

## Tech Stack 
### Backend

- **Spring Boot** (Java)
- **Firebase Firestore** (NoSQL storage)
- **SendGrid** (email invites)

### Frontend

- **React** with TypeScript & Vite
- **Tailwind CSS** for UI styling
- **Clerk** for authentication
- **React Router** for client-side routing

## Errors/Bugs
There are certain things we might include


## How to: 

### Run the Frontend
1. Navigate to frontend folder:
  ```bash 
  cd frontend
  ```

2. Add your Clerk information in a .env file:
  ```bash
  VITE_CLERK_PUBLISHABLE_KEY=your_key_here
  CLERK_SECRET_KEY=your_secret_key_here
  CLERK_PUBLIC_KEY=your_public_key_here
  VITE_CLERK_FRONTEND_API_URL=api_url_here
  ```

3. Install dependencies and start server:
  ```bash
  npm install
  npm start
  ```

### Run the Backend

1. Navigate to backend folder:
  ```bash 
  cd backend
  ```
2. Ensure Firebase credentials are set properly by adding your ``firebase_config.json`` to resources folder. 

3. Ensure SendAPI email service is also set up properly (**NOTE: failure to populate API key will prevent you from running server** ): 
  ```bash 
  SENDGRID_API_KEY=your_sendgrid_key
  ```
4. Install dependencies: 
  ```bash 
  mvn install
  ```
5. Run the server: 
  ```bash 
  ./mvnw spring-boot:run
  ```

### Interact with CU Soon

#### As an event organizer:
* Navigate to the dashboard to view all events.
* To create a new event:
  * Select the "Create New Event" button. Next, input participant emails, their necessity levels, and other relevant details. 
  * Slect the potential time range that people can input their availability.
  * After creating the event itself, you will be asked to input your own availbility before returning to the dashboard, where you event will appear as a card. 
  * Selecting this card again will bring you to the optimization screen, where you can see who has responded, their current availability on the calendar, and run the algorithim to produce the 5 best potential times.

* To delete an event, simply select the delete button on the event while at the dashboard.  

#### As an event participant:
* Navigate to the dashboard to view all events.
* Events that you were invited to join will appear under the "Events You're Participating In" header. 
* To accept an event invitation:
  * Select the accept button on the event card.
  * Select the event again and input your availability for the given time range. 
  * Select the event card again at the dashboard to update availability. 
* To decline an event invitation, simply select decline, and it will be removed from your events. 

### Run Tests

#### Frontend
Frontend integration sends can be run by:
1. Install playwright 
  ```bash
  npx playwright install
  ```
2. Run all tests at once
  ```bash
  npm run test
  ``` 

#### Backend
Backend unit tests for Service classes can be run with: 

```bash
./mvnw test
```

## Team 
CU Soon was built as part of CSCI 0320: Software Engineering at Brown University.

* Brendan Rathier (brathier28)
* Lily Young (lyoung2342)
* Max Smith-Stern (msmithstern)
* Nick Kitahata (nkitahata)

## Collaboration
We used ChatGPT to help plan backend persistence models and CSS structure. All logic and implementation were written by our team.