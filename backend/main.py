from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import io
from pydantic import BaseModel
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Optional

from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool

load_dotenv()

app = FastAPI(title="RiskIntel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = os.path.join(os.path.dirname(__file__), "data.csv")

def load_data():
    if not os.path.exists(CSV_FILE):
        return pd.DataFrame(columns=[
            "employee_id", "easy_tasks", "medium_tasks", "hard_tasks",
            "context_switches", "work_hours", "after_hours_work", "weekend_work", "last_updated"
        ])
    return pd.read_csv(CSV_FILE)

def save_data(df):
    df.to_csv(CSV_FILE, index=False)

class EmployeeSubmission(BaseModel):
    employee_id: int
    easy_tasks: int
    medium_tasks: int
    hard_tasks: int
    context_switches: int
    work_hours: float
    after_hours_work: float
    weekend_work: bool

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        required_columns = [
            "employee_id", "easy_tasks", "medium_tasks", "hard_tasks",
            "context_switches", "work_hours", "after_hours_work", "weekend_work"
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing_columns)}")
            
        if "last_updated" not in df.columns:
            df["last_updated"] = datetime.now().strftime("%Y-%m-%d")
            
        save_data(df)
        return {"message": "File uploaded and saved successfully", "records": len(df)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

def calculate_burnout_risk(emp):
    # Support both dict (from records) and Series (from pandas)
    easy = int(emp["easy_tasks"])
    medium = int(emp["medium_tasks"])
    hard = int(emp["hard_tasks"])
    context_switches = int(emp["context_switches"])
    work_hours = float(emp["work_hours"])
    after_hours_work = float(emp["after_hours_work"])
    weekend_work = bool(emp["weekend_work"])
    last_updated = emp.get("last_updated", "N/A")

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
        "employee_id": int(emp["employee_id"]),
        "easy_tasks": easy,
        "medium_tasks": medium,
        "hard_tasks": hard,
        "work_hours": work_hours,
        "workload_score": workload,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendations": recommendations,
        "last_updated": last_updated
    }

@app.post("/submit")
async def submit_daily_data(submission: EmployeeSubmission):
    df = load_data()
    
    new_record = submission.dict()
    new_record["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    
    # Check if entry for this employee and date already exists, if so update it
    mask = (df["employee_id"] == submission.employee_id) & (df["last_updated"] == new_record["last_updated"])
    if mask.any():
        for col, val in new_record.items():
            df.loc[mask, col] = val
    else:
        df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
    
    save_data(df)
    
    analysis = calculate_burnout_risk(new_record)
    return analysis

@app.get("/latest")
def get_latest_data():
    df = load_data()
    if df.empty:
        return []
    
    # Sort by date and drop duplicates to keep latest per employee
    df["last_updated"] = pd.to_datetime(df["last_updated"])
    latest_df = df.sort_values("last_updated", ascending=False).drop_duplicates("employee_id")
    
    # Optional: convert back to string
    latest_df["last_updated"] = latest_df["last_updated"].dt.strftime("%Y-%m-%d")
    
    results = [calculate_burnout_risk(row) for _, row in latest_df.iterrows()]
    return results

@app.get("/analyze_all")
def analyze_all():
    return get_latest_data()

@app.get("/analyze/{employee_id}")
def analyze_one(employee_id: int):
    df = load_data()
    emp_data = df[df["employee_id"] == employee_id]
    if emp_data.empty:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get the latest entry
    emp_data["last_updated"] = pd.to_datetime(emp_data["last_updated"])
    latest = emp_data.sort_values("last_updated", ascending=False).iloc[0]
    return calculate_burnout_risk(latest)

# LangChain Agent Setup
@tool
def analyze_employee(employee_id: int) -> str:
    """Analyze an employee's burnout risk given their employee ID."""
    try:
        res = analyze_one(employee_id)
        return (
            f"Employee ID: {res['employee_id']}\n"
            f"Workload Score: {res['workload_score']}\n"
            f"Risk Score: {res['risk_score']} ({res['risk_level']} Risk)\n"
            f"Reasons: {', '.join(res['reasons'])}\n"
            f"Recommendations: {', '.join(res['recommendations'])}\n"
            f"Last Entry Date: {res['last_updated']}"
        )
    except HTTPException:
        return "Employee not found."

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured in .env file.")

    try:
        system_prompt = f"""You are an expert HR assistant specializing in employee burnout risk analysis.

=== INSTRUCTIONS ===
1. If the query mentions a specific employee ID (e.g., #1 or Employee 1), you MUST use the 'analyze_employee' tool immediately to fetch their specific data.
2. Focus EXCLUSIVELY on the employee requested. Do not provide a general team summary unless specifically asked.
3. Based on the tool's output, provide exactly 5 HIGHLY SPECIFIC and ACTIONABLE recommendations tailored to that employee's risk factors.
4. Do not invent data. Use only the tool output.
5. Format your response professionally with a numbered list for recommendations."""

        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0, api_key=groq_api_key)
        tools = [analyze_employee]
        
        agent_executor = create_react_agent(llm, tools)
        
        response = agent_executor.invoke({
            "messages": [
                ("system", system_prompt),
                ("human", request.query)
            ]
        })
        
        ai_message = response["messages"][-1].content
        return {"response": ai_message}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
