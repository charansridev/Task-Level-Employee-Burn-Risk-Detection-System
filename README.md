# Task-Level Employee Burnout Risk Detection System

🚀 **Burnout Risk Analyzer** is an enterprise-grade AI-assisted workforce analytics system built to detect early signs of employee burnout using daily task-level work patterns. 

This project was built as a hackathon submission for the **Xe-Conclave 2026, 24-Hour National Level Hackathon** conducted by **Xebia** at **Takshashila University** on **29th & 30th April 2026**.

## 📜 Hackathon Certificate of Participation
![Xe-Conclave 2026 Hackathon Certificate](./certificate.jpg)

---

## 📌 Project Overview (Xebia Hackathon Topic #16)


### 🎯 Objective
Organizations lack visibility into how task overload, context switching, and work pattern irregularities contribute to early employee burnout. Existing productivity tools track activity but do not analyze task-level behavioral signals to detect burnout risk in advance.

### 📝 Description
The system monitors work data such as task load, frequency of context switching, work duration, and productivity patterns. Using analytics and pattern recognition, it identifies indicators of overload, fragmented work, and irregular work habits that may lead to burnout. It explains the contributing factors behind the risk and provides insights for both managers and employees to take preventive actions before burnout occurs.

### 🏆 Expected Outcomes
A task-level burnout risk detection system that analyzes workload intensity, task fragmentation, and productivity patterns to generate early burnout risk indicators and explain contributing factors for managers and employees.

---

## 🏗️ System Architecture & Folder Structure

The project is structured as a decoupled monorepo containing a FastAPI backend and a React/Vite frontend:

```text
Task-Level-Employee-Burn-Risk-Detection-System/
├── backend/
│   ├── Dockerfile             # Builds the FastAPI container
│   ├── main.py                # FastAPI backend endpoints, SQLAlchemy models, and AI agent logic
│   ├── requirements.txt       # Python dependencies (SQLAlchemy, psycopg2-binary, LangChain, etc.)
│   └── .env                   # Local environment variables (ignored by Git)
├── frontend/
│   ├── src/                   # React source code (UI pages, metrics dashboard, chat interface)
│   ├── Dockerfile             # Builds the React/Vite development server container
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind CSS styling configurations
│   └── index.html             # HTML entry point
├── docker-compose.yml         # Orchestrates backend & frontend container execution
└── README.md                  # Project documentation
```

---

## ⚙️ Technologies & Libraries Used

### Backend
* **FastAPI:** High performance, asynchronous framework for building APIs.
* **SQLAlchemy & PostgreSQL:** Database layer (compatible with free cloud DBs like Supabase or Neon Tech) to store employee metrics.
* **LangChain & LangGraph:** Builds the AI tool-calling agent to fetch metrics and reason over burnout risk factors.
* **Groq (Llama 3.1 8B):** Generates natural language explanations and HR recommendations.

### Frontend
* **React (Vite):** Fast frontend library and dev server.
* **Recharts:** Interactive data visualization of team risk distribution.
* **Lucide React:** Modern clean icon set.

---

## 🧠 Burnout Risk Scoring Engine

The backend implements an automated, objective heuristic scoring engine to assess employee burnout risk from daily task metrics:

### 1. Workload & Complexity Weighting
* **Workload Score**: Weighted task complexity metric:
  $$\text{Workload} = (\text{Easy Tasks} \times 1) + (\text{Medium Tasks} \times 2) + (\text{Hard Tasks} \times 3)$$
* **Hard Task Ratio**: Proportion of cognitively demanding work:
  $$\text{Hard Task Ratio} = \frac{\text{Hard Tasks}}{\text{Total Tasks}}$$

### 2. Heuristic Risk Scoring Rules
Risk points accumulate based on behavioral and workload signals:

| Factor | Condition | Risk Points | Flagged Reason | Actionable Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **High Workload** | Workload Score $> 40$ | $+20$ | High overall workload | Redistribute tasks to reduce workload |
| **Cognitive Overload** | Hard Task Ratio $> 40\%$ | $+15$ | High ratio of hard tasks | Assign more easy/medium tasks to balance cognitive load |
| **Task Fragmentation** | Context Switches $> 15$ | $+20$ | Frequent context switches | Encourage focused work blocks and reduce interruptions |
| **Long Hours** | Work Hours $> 10$ hrs/day | $+20$ | Long working hours | Ensure the employee sticks to standard working hours |
| **Off-Hours Strain** | After-Hours Work $> 2$ hrs | $+15$ | Significant after-hours work | Discourage working after standard hours |
| **Rest Deprivation** | Weekend Work $=$ `True` | $+10$ | Working on weekends | Protect weekends for rest and recovery |

### 3. Risk Classification Levels
* 🟢 **Low Risk (0 – 29)**: Sustainable workload and healthy work habits.
* 🟡 **Medium Risk (30 – 69)**: Emerging strain; requires managerial review and balance.
* 🔴 **High Risk (70 – 100)**: Critical burnout indicators; urgent workload redistribution needed.

---

## 🚀 Setup & Installation Guide

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### 1. Database Setup
The system uses a PostgreSQL database. You can provision a free Postgres database in seconds using [Supabase](https://supabase.com/):
1. Sign up for a free Supabase account and create a project.
2. Go to **Project Settings** -> **Database** -> **Connection string** (URI mode) and copy the URL.
3. Replace the `[YOUR-PASSWORD]` placeholder in the URL with your project's database password.

### 2. Configure Environment Variables
Create a file named `.env` in the `backend/` folder:

**Path:** `backend/.env`
```env
DATABASE_URL=postgresql://postgres.yourref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Build and Run the App with Docker

Run the following command from the root directory to build and spin up the containers:
```bash
docker-compose up --build
```

* **Frontend Dashboard:** Available at `http://localhost:5173`
* **Backend API Docs (Swagger):** Available at `http://localhost:8000/docs`

---

## 🔌 API Endpoints
* `POST /submit` - Submit daily employee metrics.
* `GET /latest` - Retrieve the latest processed metrics for all employees.
* `GET /analyze/{employee_id}` - Get burnout assessment for a specific employee.
* `POST /chat` - Interact with the AI assistant for custom HR insights.
