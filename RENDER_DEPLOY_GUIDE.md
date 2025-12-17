# Deployment Guide for Render

Yes, you can deploy the full application (Frontend + Backend) on Render as a single **Web Service**.

## ⚠️ Critical Requirement: Database Migration
Just like with Netlify, your database is currently **local**. Render cannot access it. You **MUST** move your data to a cloud database.

### Step 1: Get a Cloud Database (Free)
1.  Sign up for **[Neon](https://neon.tech)** or **[Supabase](https://supabase.com)** (both have excellent free tiers for PostgreSQL).
2.  Create a new project/database.
3.  Get the **Connection String** (it looks like `postgres://user:password@host/dbname...`).

### Step 2: Migrate Your Data
1.  Open your local app (RKS Business).
2.  Click the **Three Dot Menu** (top right) -> **Dump Database**.
3.  This will download a `.sql` file.
4.  Connect to your new cloud database (using a tool like pgAdmin, DBeaver, or the provider's SQL editor).
5.  Run the contents of the `.sql` file to create your tables and insert your data.

### Step 3: Deploy to Render
1.  Push this code to **GitHub**.
2.  Log in to **[Render](https://render.com)**.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  Configure the service:
    *   **Name:** `rks-business` (or whatever you like)
    *   **Region:** Singapore (closest to India) or Frankfurt
    *   **Branch:** `main` (or your working branch)
    *   **Root Directory:** `.` (leave empty)
    *   **Runtime:** `Node`
    *   **Build Command:** `./render-build.sh`
    *   **Start Command:** `node server/index.js`
6.  **Environment Variables:** (Scroll down to "Advanced")
    *   Add your database credentials here so the live app can connect to the cloud DB.
    *   `PGHOST`: (your cloud host)
    *   `PGUSER`: (your cloud user)
    *   `PGPASSWORD`: (your cloud password)
    *   `PGDATABASE`: (your cloud database name)
    *   `PGPORT`: 5432
    *   `PGSSL`: true
    *   `NODE_ENV`: production
7.  Click **Create Web Service**.

## What I Configured for You
*   **`server/index.js`**: Modified to serve your React frontend files (`dist` folder) automatically.
*   **`render-build.sh`**: Created a script that installs dependencies for both frontend and backend, and builds the React app.
