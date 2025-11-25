# Backend Deployment Guide (Render.com)

This guide will walk you through deploying your Node.js backend to Render.com for free.

## Prerequisites
1.  A **GitHub Account** (free).
2.  A **Render.com Account** (free).

---

## Step 1: Push Your Code to GitHub

You need to put your code on GitHub so Render can access it.

1.  **Log in to GitHub** and create a **New Repository**.
    - Name it `rks-backend` (or anything you like).
    - Make it **Private** or **Public**.
    - Do **NOT** initialize with README, .gitignore, or License (keep it empty).

2.  **Push your code** from your terminal:
    *(Run these commands in your project folder `rks`)*
    ```bash
    # Initialize git if you haven't
    git init

    # Add all files
    git add .

    # Commit
    git commit -m "Initial commit"

    # Link to your new GitHub repo (Replace URL with YOUR repo URL)
    git remote add origin https://github.com/YOUR_USERNAME/rks-backend.git

    # Push
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Deploy to Render

1.  **Log in to [dashboard.render.com](https://dashboard.render.com)**.
2.  Click **"New +"** and select **"Web Service"**.
3.  **Connect GitHub**:
    - If you haven't, click "Connect Account" and give Render access to your repositories.
    - Find your `rks-backend` repo in the list and click **"Connect"**.

4.  **Configure the Service**:
    - **Name**: `rks-backend` (or unique name)
    - **Region**: Closest to you (e.g., Singapore or Frankfurt)
    - **Branch**: `main`
    - **Root Directory**: `server`  <-- **CRITICAL STEP!**
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node index.js`
    - **Instance Type**: `Free`

5.  **Environment Variables**:
    - Scroll down to "Environment Variables".
    - Click **"Add Environment Variable"** for each of these (copy values from your `server/.env` file):
        - `PGUSER`
        - `PGPASSWORD`
        - `PGHOST`
        - `PGDATABASE`
        - `PGPORT`
        - `PGSSL` (Value: `true`)

6.  Click **"Create Web Service"**.

---

## Step 3: Get the URL

1.  Render will start building your app. It may take 2-3 minutes.
2.  Once it says **"Live"**, look at the top left (under the name).
3.  You will see a URL like: `https://rks-backend-xyz.onrender.com`.
4.  **Copy this URL.**

---

## Step 4: Final Step

**Paste that URL back to me in the chat.**

I will then:
1.  Update your App to use this new online server.
2.  Build the final APK for you.
