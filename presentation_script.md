# RiskIntel - Hackathon Presentation Guide

This document is structured to help you present your project to the judges effectively within the 8-minute time limit, directly addressing the provided judging criteria.

---

## 🕒 1. The Pitch (3-5 Minutes)

### Introduction & Problem Statement
* **The Problem (Impact & Relevance - 10 points):** "Hello judges. We are presenting RiskIntel, our Burnout Risk Analyzer. Today, HR teams and managers lack real-time, objective tools to identify employee burnout. Traditional methods rely on subjective, delayed surveys. By the time an employee reports feeling burnt out, their productivity and well-being have already severely declined."
* **Our Solution (Innovation & Creativity - 20 points):** "Our solution bridges this gap. We've built a data-driven, proactive platform that analyzes quantifiable workload metrics—like task difficulty, context switching, and after-hours work—to predict burnout risk *before* it becomes a crisis. We've also integrated an Agentic AI to act as a specialized HR co-pilot."

### Architecture & Tech Stack
* **Technical Execution (20 points):** 
  * "We built a robust, decoupled Full-Stack application."
  * **Frontend:** React.js powered by Vite, providing a fast, responsive, and dynamic dashboard.
  * **Backend:** Python FastAPI for high-performance API endpoints, using Pandas for in-memory data processing and CSV ingestion.
  * **End-to-End Deployment (25 points):** "The system is fully dynamic. It's not just a static data website. The frontend dynamically consumes REST APIs from the backend. The backend can ingest real-time data uploads, process it, and serve it back instantly. It is production-ready for deployment on platforms like Vercel (frontend) and Render (backend)."

### AI & Prompting Strategy
* **AI Integration (5 points):** "We didn't just add a generic chatbot. We implemented a **ReAct (Reason and Act) Agent** using LangChain and the Groq API (running Llama 3). This agent is context-aware."
* **Prompting Techniques (5 points):** "We used advanced prompting techniques in our backend. Our System Prompt strictly guides the LLM to act as an Expert HR Assistant. When you ask about an employee, the AI actually uses a custom-built Python tool (`analyze_employee`) to query the backend data, injects that specific employee's metrics into its context, and generates exactly 5 highly specific, actionable recommendations."

---

## 💻 2. The Live Demo (3 Minutes)

* **Step 1: The Dashboard overview.** 
  * *Action:* Open the main web app.
  * *Script:* "Here is the dynamic dashboard. It ingests data from our backend and instantly categorizes employees into Low, Medium, and High-risk buckets based on our weighted heuristic algorithm (which looks at task volume, context switches, and overtime)."
* **Step 2: Dynamic Data Upload.**
  * *Action:* Show the CSV upload functionality or explain how data is dynamically updated.
  * *Script:* "Our app handles dynamic data. Managers can upload daily or weekly CSV dumps from Jira or their task management tools, and the backend updates the risk scores instantly."
* **Step 3: AI Assistant in Action (The 'Wow' Factor).**
  * *Action:* Open the chat interface and type: *"Give me an analysis for employee #3"*
  * *Script:* "Here is where the Agentic AI shines. I ask about Employee 3. The LangChain agent recognizes it needs data, triggers our internal API tool, fetches Employee 3's high context-switch rate, and generates targeted advice on how to redistribute their workload."

---

## ❓ 3. Anticipated Q&A (Remaining Time)

* **Q: "How did you manage version control and teamwork?"**
  * **A (GitHub Commits - 5 points):** "We used Git and GitHub extensively for version control. We maintained a clean commit history to track the evolution from a basic script to a full-stack application, ensuring collaborative and organized development."
* **Q: "Why didn't you use a standard database like SQL?"**
  * **A:** "For the rapid prototyping phase of this hackathon, we used Pandas with an in-memory CSV approach for maximum speed and simplicity. However, our FastAPI architecture abstracts the data layer, meaning swapping the CSV logic for PostgreSQL or SQLite would require zero changes to our frontend or AI logic."
* **Q: "How does your heuristic scoring work?"**
  * **A:** "We weigh hard tasks more heavily than easy ones. We heavily penalize high context switching (shifting between different types of tasks) and working after hours, as research shows these are the primary drivers of cognitive fatigue."

---

## 📋 Checklist for the Presenter
- [ ] Ensure the FastAPI backend is running (`uvicorn main:app --reload`).
- [ ] Ensure the React frontend is running (`npm run dev`).
- [ ] Have a sample `data.csv` ready to upload to show dynamic capabilities.
- [ ] Have your `.env` file properly configured with the `GROQ_API_KEY`.
