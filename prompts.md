# System Prompts & Prompt Engineering Strategy

This document details the prompt structures used in RiskIntel, specifically designed to address the **"Prompting technique's (5 points)"** criteria for the hackathon.

## 1. Core System Prompt (The Agent Persona)

This is the foundational prompt injected into the LangChain ReAct (Reason and Act) Agent running on the Groq LLM (Llama 3). It establishes the persona, strict constraints, and the expected output format.

```text
You are an expert HR assistant specializing in employee burnout risk analysis.

=== INSTRUCTIONS ===
1. If the query mentions a specific employee ID (e.g., #1 or Employee 1), you MUST use the 'analyze_employee' tool immediately to fetch their specific data.
2. Focus EXCLUSIVELY on the employee requested. Do not provide a general team summary unless specifically asked.
3. Based on the tool's output, provide exactly 5 HIGHLY SPECIFIC and ACTIONABLE recommendations tailored to that employee's risk factors.
4. Do not invent data. Use only the tool output.
5. Format your response professionally with a numbered list for recommendations.
```

### Why this structure works (Explain this to the judges):
*   **Persona Assignment:** "You are an expert HR assistant..." grounds the LLM in a specific professional tone.
*   **Tool Binding (Constraint 1):** It forces the LLM to trigger our internal Python tool (`analyze_employee`) rather than hallucinating generic advice. This is crucial for the ReAct pattern.
*   **Zero-Hallucination Guardrails (Constraints 2 & 4):** Strictly bounds the LLM to only use the context provided by our internal API, preventing it from making up metrics.
*   **Format Constraints (Constraints 3 & 5):** Guarantees a consistent, easily readable UI experience (exactly 5 items, numbered list).

---

## 2. Example User Prompts for the Demo

When demonstrating the AI Assistant to the judges, use these carefully crafted prompts to showcase the agent's capabilities:

### A. The Direct Retrieval Prompt
*Demonstrates the agent's ability to fetch and analyze a specific user.*
> **"Give me a detailed burnout analysis for employee #3."**
*   **What it does:** Triggers the system prompt's rule #1. The AI fetches Employee 3's stats, notices high context switching or overtime (based on the heuristics), and gives 5 targeted recommendations.

### B. The Mitigation Strategy Prompt
*Demonstrates the AI acting as an HR strategist.*
> **"Employee 2 has a high risk score. What specific steps can I take as a manager today to reduce their cognitive load?"**
*   **What it does:** Forces the AI to interpret the fetched data and provide highly specific, actionable advice rather than generic "tell them to take a break."

### C. The Comparative Query (If supported by tools)
*Demonstrates advanced understanding.*
> **"Summarize the main reasons for burnout for Employee 1 and provide a structured plan to fix it."**
*   **What it does:** Checks the strict formatting rules (numbered list) and ensures the AI doesn't hallucinate data outside of Employee 1's profile.
