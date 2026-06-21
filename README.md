# ✈️ AI Trip Planner

An AI-powered travel planning platform that helps users create personalized trip itineraries based on destination, duration, budget, and interests. Users can manage trips, track expenses, customize daily activities, and regenerate itinerary suggestions using AI.

---

## 🚀 Features

### Authentication

* User Registration and Login
* JWT-based Authentication
* Protected Routes
* Persistent Login using Cookies

### Trip Planning

* Create AI-generated travel itineraries
* Customize:

  * Destination
  * Number of Days
  * Budget Level
  * Travel Interests

### Dashboard

* View all planned trips
* Quick trip overview cards
* Delete unwanted trips
* Create new trips through an interactive modal

### Trip Details

* Day-wise itinerary timeline
* Add custom activities
* Delete activities
* Regenerate individual days using AI prompts
* Hotel recommendations
* Budget estimation breakdown

### Expense Tracker

* Add trip expenses
* Categorize expenses
* Track actual spending
* Compare actual spending with estimated budget
* Delete expense entries

### User Experience

* Responsive UI
* Modern and clean interface
* Loading states and error handling
* Empty state screens
* Reusable component architecture

---

## 🛠️ Tech Stack

### Frontend

* React
* React Router DOM
* Context API
* JavaScript (ES6+)
* CSS3
* React Icons
* js-cookie

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Tokens)
* Cookies

---

## 📂 Project Structure

```text
ai-trip-planner
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── server.js
│
├── src
│   ├── components
│   │   ├── Navbar
│   │   ├── DashboardHeader
│   │   ├── EmptyState
│   │   ├── TripCard
│   │   ├── CreateTripModal
│   │   ├── TripHero
│   │   ├── HotelSelection
│   │   ├── BudgetSection
│   │   ├── ExpenseTracker
│   │   ├── ItenarySection
│   │   └── RegenerateDayModal
│   │
│   ├── context
│   │   └── AuthContext
│   │
│   ├── pages
│   │   ├── Login
│   │   ├── SignUp
│   │   ├── Dashboard
│   │   ├── TripDetails
│   │   └── NotFound
│   │
│   └── App.jsx
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/POTTI-MOKSHAGNA/Ai-Trip-Planner.git
cd ai-trip-planner
```

### Install Frontend Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=YOUR_API_KEY
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd backend
npm start
```

### Start Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:5000
```

---

## 📸 Application Workflow

1. Register or Login
2. Create a new trip
3. Select destination, duration, budget, and interests
4. Generate itinerary
5. View day-wise travel plan
6. Add or modify activities
7. Track trip expenses
8. Compare actual spending with estimated budget
9. Manage all trips from the dashboard

---

## 🎯 Learning Outcomes

* React Component Architecture
* Context API State Management
* JWT Authentication
* Protected Routing
* REST API Integration
* MongoDB Data Modeling
* Expense Tracking Logic
* CRUD Operations
* Full Stack Application Development

---

## 👨‍💻 Author

**Mokshagna Potti**

* GitHub: https://github.com/POTTI-MOKSHAGNA
* LinkedIn: https://www.linkedin.com/in/mokshagna-potti/

---

⭐ If you found this project helpful, consider giving it a star.
