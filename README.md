# Daily Tracker

A web app for tracking daily activities and expenses with charts and history.

## Features

- Log activities with categories, duration, and status
- Track expenses by category and payment mode
- View dashboard with KPIs and charts
- Search and filter history
- Export data to CSV
- Daily summary reports
- Responsive design for mobile and desktop

## Deployment

### Option 1: Railway (Free Trial - Then Paid)

**Railway offers a generous free tier:**
- $5/month credit for new users
- MySQL database included
- Automatic deployments from GitHub

**After trial:** ~$5-10/month for basic usage

### Option 2: Render (Free Forever!)

**Render is completely free for small projects:**
- 750 hours/month free
- PostgreSQL database (free tier available)
- Automatic deployments from GitHub
- No credit card required

### Option 3: Fly.io (Free Tier Available)

**Fly.io free tier:**
- 3 shared CPU VMs
- 256MB RAM per VM
- 160GB outbound data/month
- SQLite or external databases

### Option 4: Vercel + PlanetScale (Free Forever!)

**Vercel (Frontend) + PlanetScale (Database):**
- Vercel: Free forever for static sites
- PlanetScale: 1 database, 1GB storage free
- Great for full-stack apps

### Option 5: Supabase (Free Forever!)

**Supabase free tier:**
- PostgreSQL database
- 500MB database size
- 50MB file storage
- 2GB bandwidth
- Real-time features included

### Recommended: Render (Easiest Free Option)

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up (no credit card needed)
2. **Create PostgreSQL Database**:
   - Click "New" → "PostgreSQL"
   - Choose free tier
   - Note the connection details
3. **Deploy Backend**:
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables:
     ```
     DB_HOST=your-render-postgres-host
     DB_USER=your-db-user
     DB_PASSWORD=your-db-password
     DB_NAME=your-db-name
     DB_PORT=5432
     ```
4. **Update Frontend**: Replace API_BASE URL in `script.js` with your Render backend URL

### For Render (PostgreSQL):

If using Render's PostgreSQL, install `pg` instead of `mysql2`:

```bash
npm uninstall mysql2
npm install pg
```

Then update the database connection in `server.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Update all db.query calls to use pool.query
```

### Prerequisites

- Node.js (for backend)
- MySQL server

### Backend Setup

1. Install MySQL and make sure the server is running.
2. Create a `.env` file inside the `backend` folder with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
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
