# Daily Tracker

A web app for tracking daily activities and expenses with charts and history.

## Features

- Log activities with categories, duration, and status
- Track expenses by category and payment mode
- View dashboard with KPIs and charts
- Search and filter history
- Export data to CSV
- Responsive design for mobile and desktop

## Setup

### Prerequisites

- Node.js (for backend)
- MySQL server

### Backend Setup

1. Install MySQL and make sure the server is running.
2. Create a `.env` file inside the `backend` folder with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=Divakar@07
   DB_NAME=daily_tracker
   PORT=3000
   ```

   Or set env vars directly on your system.
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
4. Start the backend server:
   ```
   npm start
   ```
   The server will create the `daily_tracker` database and tables automatically, then run on http://localhost:3000

### Frontend

Open `index.html` in a browser. The app will connect to the backend API.

## Database Schema

### Activities Table
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- date (DATE)
- time (TIME)
- name (VARCHAR(255))
- category (VARCHAR(100))
- duration (DECIMAL(5,2))
- status (VARCHAR(50))
- notes (TEXT)

### Expenses Table
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- date (DATE)
- name (VARCHAR(255))
- category (VARCHAR(100))
- amount (DECIMAL(10,2))
- mode (VARCHAR(50))
- notes (TEXT)

## Usage

1. Start the backend server
2. Open index.html in browser
3. Log activities and expenses
4. View dashboard and history
5. Export data as needed

## Technologies

- Frontend: HTML, CSS, JavaScript, Chart.js
- Backend: Node.js, Express, MySQL