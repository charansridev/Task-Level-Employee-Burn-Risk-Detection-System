# Deploying to Render with Supabase PostgreSQL

Here is a step-by-step guide to deploy both the **FastAPI Backend (Docker Container)** and the **React Frontend (Static Site)** on Render.

---

## 1. Deploy the Backend (Docker Web Service)

Since we have a `Dockerfile` inside the `backend/` directory, Render can build and deploy it automatically.

### Step 1: Create a new Web Service
1. Log in to [Render](https://render.com/).
2. Click the **New +** button on the top right and select **Web Service**.
3. Connect your GitHub account and choose the **Task-Level-Employee-Burn-Risk-Detection-System** repository.

### Step 2: Configure Service Settings
1. **Name:** `burnout-risk-backend` (or any name you prefer).
2. **Region:** Choose the region closest to you (or your Supabase database region).
3. **Branch:** `main`
4. **Root Directory:** `backend` *(This is important! It tells Render to build inside the backend folder)*.
5. **Runtime:** **Docker** *(Render should auto-detect this once you set the Root Directory)*.
6. **Instance Type:** Select the **Free** tier.

### Step 3: Add Environment Variables
1. Scroll down to the **Advanced** section or click **Environment**.
2. Click **Add Environment Variable** and add the following:
   * **Key:** `DATABASE_URL`
   * **Value:** `postgresql://postgres:Dev%408985514241@db.zuwnmdhruyxkxcnofodk.supabase.co:5432/postgres`
3. *(Optional)* If using the AI Chat assistant, add your Groq key:
   * **Key:** `GROQ_API_KEY`
   * **Value:** `your_groq_api_key_here`
4. Click **Create Web Service**. 

*Render will now pull the code, build the Docker container, and deploy it. Once the deploy completes, copy your backend URL (e.g., `https://burnout-risk-backend.onrender.com`).*

---

## 2. Deploy the Frontend (Static Site)

### Step 1: Update API URL in Frontend
Before deploying the frontend, update the API URL in the React code to point to your new Render backend instead of `localhost:8000`.

1. Open `frontend/src/App.jsx`.
2. Locate line 69:
   ```javascript
   const res = await fetch('http://localhost:8000/submit', {
   ```
3. Change `http://localhost:8000` to your Render backend URL (e.g., `https://burnout-risk-backend.onrender.com/submit`). Do the same for any other fetch calls (like `/latest` or `/chat` or `/analyze`).
   * *Tip: To make this automatic, you can use relative paths or environment variables, but for a hackathon, replacing the URL directly in `App.jsx` works perfectly.*

### Step 2: Create a Static Site on Render
1. Click the **New +** button on Render and select **Static Site**.
2. Choose the same GitHub repository.
3. Configure settings:
   * **Name:** `burnout-risk-analyzer`
   * **Branch:** `main`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
4. Click **Create Static Site**.

---

## 3. Configure CORS on Backend (If Needed)

Currently, the backend has CORS enabled for all origins (`allow_origins=["*"]`), which means the React frontend running on Render will be allowed to talk to the backend without any blocks!
