# Deployment Guide for Hospital Token Booking System

Hosting a MERN (MongoDB, Express, React, Node) app involves 3 parts:
1.  **Database**: MongoDB Atlas (Stores your data in the cloud).
2.  **Backend API**: Render (Runs your Node.js server).
3.  **Frontend**: Vercel (Hosts your React user interface).

---

## Step 1: Database (MongoDB Atlas)
**You simple cannot host the app without this.** The server needs a place to store users and appointments that is accessible from the internet.

1.  **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  **Create Cluster**: Build a default **Free** cluster (Shared).
3.  **Database Access**: Create a database user (username/password).
4.  **Network Access**: Add IP Address `0.0.0.0/0` (Allow from anywhere).
5.  **Get Connection String**:
    *   Click "Connect" -> "Connect your application".
    *   Copy the string (e.g., `mongodb+srv://user:pass@...`).
    *   **SAVE THIS**. You will need it for the Backend deployment.

---

## Step 2: Backend Deployment (Render)
Render is a great free option for Node.js backends.

1.  **Push Code to GitHub**:
    *   Initialize a git repo in your project root: `git init`, `git add .`, `git commit -m "initial commit"`.
    *   Push this to a new GitHub repository.
2.  **Create Web Service on Render**:
    *   Go to [Render.com](https://render.com/).
    *   Click "New" -> "Web Service".
    *   Connect your GitHub repository.
3.  **Configure**:
    *   **Root Directory**: `server` (Important! Your server code is in this folder).
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  **Environment Variables**:
    *   Scroll down to "Environment Variables".
    *   Add `MONGO_URI`: (Paste your connection string from Step 1).
    *   Add `JWT_SECRET`: (Any secret random string).
    *   Add `NODE_ENV`: `production`.
5.  **Deploy**: Click "Create Web Service".
    *   Once finished, Render will give you a URL (e.g., `https://hospital-server.onrender.com`).
    *   **Copy this URL**.

---

## Step 3: Frontend Deployment (Vercel)
Vercel is optimized for frontend apps like Vite/React.

1.  Go to [Vercel.com](https://vercel.com/) and login with GitHub.
2.  **Add New Project**: Import the same GitHub repository.
3.  **Configure**:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Build Command**: `vite build` (Default is usually correct).
    *   **Output Directory**: `dist` (Default is usually correct).
4.  **Environment Variables**:
    *   **IMPORTANT**: You need to tell the frontend where the backend is.
    *   Usually, your frontend code (`client/src`) likely has a hardcoded URL (like `http://localhost:5000`) or uses an environment variable.
    *   **CHECK YOUR CODE**: Look at `client/src/App.jsx` or your API service files. You must replace `http://localhost:5000` with your new Render Backend URL.
    *   *Best Practice*: Use `VITE_API_URL` in `.env` and `import.meta.env.VITE_API_URL` in your code.
5.  **Deploy**: Click "Deploy".

---

## Step 4: Final Connection
1.  Update your Frontend code to point to the **Render Backend URL** (e.g., `https://hospital-server.onrender.com`) instead of `localhost:5000`.
2.  Push the code change to GitHub.
3.  Vercel will automatically redeploy the frontend.
