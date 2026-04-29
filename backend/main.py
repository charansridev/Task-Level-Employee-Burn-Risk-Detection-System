from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool

load_dotenv()

app = FastAPI(title="Burnout Risk Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
DATA_FILE = "data.csv"

def get_employee_data():
    df = pd.read_csv(DATA_FILE)
    return df.to_dict(orient="records")

def calculate_burnout_risk(emp):
    easy = emp["easy_tasks"]
    medium = emp["medium_tasks"]
    hard = emp["hard_tasks"]
    context_switches = emp["context_switches"]
    work_hours = emp["work_hours"]
    after_hours_work = emp["after_hours_work"]
    weekend_work = emp["weekend_work"]

    # Weighted Workload Logic
    workload = easy * 1 + medium * 2 + hard * 3
    
    total_tasks = easy + medium + hard
    hard_task_ratio = (hard / total_tasks) if total_tasks > 0 else 0

    risk_score = 0
    reasons = []
    recommendations = []

    # Burnout Risk Scoring Rules
    if workload > 40:
        risk_score += 20
        reasons.append("High overall workload")
        recommendations.append("Redistribute tasks to reduce workload")
    
    if hard_task_ratio > 0.40:
        risk_score += 15
        reasons.append(f"High ratio of hard tasks ({hard_task_ratio*100:.1f}%)")
        recommendations.append("Assign more easy/medium tasks to balance the cognitive load")

    if context_switches > 15:
        risk_score += 20
        reasons.append(f"Frequent context switches ({context_switches})")
        recommendations.append("Encourage focused work blocks and reduce interruptions")

    if work_hours > 10:
        risk_score += 20
        reasons.append(f"Long working hours ({work_hours} hrs/day)")
        recommendations.append("Ensure the employee sticks to standard working hours")

    if after_hours_work > 2:
        risk_score += 15
        reasons.append(f"Significant after-hours work ({after_hours_work} hrs)")
        recommendations.append("Discourage working after standard hours")

    if weekend_work:
        risk_score += 10
        reasons.append("Working on weekends")
        recommendations.append("Protect weekends for rest and recovery")

    # Risk Levels
    if risk_score <= 29:
        risk_level = "Low"
    elif risk_score <= 69:
        risk_level = "Medium"
    else:
        risk_level = "High"

    if not reasons:
        reasons.append("No significant burnout risk factors detected")
        recommendations.append("Continue current work patterns")

    return {
        "employee_id": emp["employee_id"],
        "easy_tasks": easy,
        "medium_tasks": medium,
        "hard_tasks": hard,
        "work_hours": work_hours,
        "workload_score": workload,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendations": recommendations
    }

@app.get("/analyze_all")
def analyze_all():
    employees = get_employee_data()
    results = [calculate_burnout_risk(emp) for emp in employees]
    return results

@app.get("/analyze/{employee_id}")
def analyze_one(employee_id: int):
    employees = get_employee_data()
    for emp in employees:
        if emp["employee_id"] == employee_id:
            return calculate_burnout_risk(emp)
    raise HTTPException(status_code=404, detail="Employee not found")

# LangChain Agent Setup
@tool
def analyze_employee(employee_id: int) -> str:
    """Analyze an employee's burnout risk given their employee ID."""
    employees = get_employee_data()
    for emp in employees:
        if emp["employee_id"] == employee_id:
            res = calculate_burnout_risk(emp)
            return (
                f"Employee ID: {res['employee_id']}\n"
                f"Workload Score: {res['workload_score']}\n"
                f"Risk Score: {res['risk_score']} ({res['risk_level']} Risk)\n"
                f"Reasons: {', '.join(res['reasons'])}\n"
                f"Recommendations: {', '.join(res['recommendations'])}"
            )
    return "Employee not found."

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured in .env file.")

    try:
        # Build full dataset context for the model
        employees = get_employee_data()
        all_analysis = [calculate_burnout_risk(emp) for emp in employees]

        dataset_summary = "=== COMPLETE EMPLOYEE DATASET ===\n"
        for emp, analysis in zip(employees, all_analysis):
            total_tasks = emp["easy_tasks"] + emp["medium_tasks"] + emp["hard_tasks"]
            dataset_summary += (
                f"\nEmployee #{emp['employee_id']}:\n"
                f"  Tasks — Easy: {emp['easy_tasks']}, Medium: {emp['medium_tasks']}, Hard: {emp['hard_tasks']} (Total: {total_tasks})\n"
                f"  Work Hours/Day: {emp['work_hours']}, After-Hours: {emp['after_hours_work']} hrs, Weekend Work: {emp['weekend_work']}\n"
                f"  Context Switches: {emp['context_switches']}\n"
                f"  Workload Score: {analysis['workload_score']}, Risk Score: {analysis['risk_score']} ({analysis['risk_level']} Risk)\n"
                f"  Reasons: {', '.join(analysis['reasons'])}\n"
                f"  Recommendations: {', '.join(analysis['recommendations'])}\n"
            )

        system_prompt = f"""You are an expert HR assistant specializing in employee burnout risk analysis.

You have access to the complete employee dataset below. Use this data to answer questions accurately.
NEVER invent or fabricate data — only use what is provided.

{dataset_summary}

=== INSTRUCTIONS ===
When asked about a specific employee or the team:
1. Analyze their workload (weighted score from easy/medium/hard tasks), working hours, after-hours work, weekend work, and context switches.
2. Always provide exactly 5 actionable recommendations based on:
   - Workload distribution (number and difficulty of tasks)
   - Time spent (work hours, after-hours, weekend work)
   - Task volume and context switching patterns
3. Be professional, concise, and data-driven in your responses.
4. Format recommendations as a numbered list.
5. If comparing employees, highlight key differences in workload and time patterns."""

        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=groq_api_key)
        tools = [analyze_employee]
        
        agent_executor = create_react_agent(llm, tools)
        
        response = agent_executor.invoke({
            "messages": [
                ("system", system_prompt),
                ("human", request.query)
            ]
        })
        
        # Extract the final AI message content
        ai_message = response["messages"][-1].content
        return {"response": ai_message}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
