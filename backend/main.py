import os
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from agent import agent_engine
from rag import rag_engine

app = FastAPI(
    title="Flight Disruption Agent API",
    description="Agentic AI tool for managing flight disruptions, passenger rebooking, and policy-grounded communications.",
    version="1.0.0"
)

# Enable CORS for frontend Vite application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite server and production clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Data file {filename} not found.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/test")
def test_health():
    return {
        "status": "online",
        "message": "Flight Disruption Agent Backend is active",
        "version": "1.0.0"
    }

@app.get("/api/passengers")
def get_passengers():
    return load_json("passengers.json")

@app.get("/api/flights")
def get_flights():
    return load_json("flights.json")

@app.get("/api/policy")
def get_policy():
    policy_path = os.path.join(DATA_DIR, "policy.md")
    if os.path.exists(policy_path):
        with open(policy_path, "r", encoding="utf-8") as f:
            return {"policy_content": f.read()}
    return {"policy_content": "No policy document found."}

@app.post("/api/simulate-disruption")
def simulate_disruption(payload: Dict[str, Any] = Body(...)):
    """
    Simulates a disruption event (delay/cancellation) and runs the multi-step reasoning agent
    across all affected passengers. Returns results sorted by urgency flag.
    """
    flight_number = payload.get("flight_number", "6E-204")
    delay_minutes = int(payload.get("delay_minutes", 180))
    reason = payload.get("reason", "Severe Technical Inspection & Weather Alert")
    disruption_type = payload.get("type", "delay")
    
    passengers = load_json("passengers.json")
    flight_data = load_json("flights.json")
    alternative_flights = flight_data.get("alternative_flights", [])
    
    disruption_event = {
        "flight_number": flight_number,
        "delay_minutes": delay_minutes,
        "reason": reason,
        "type": disruption_type,
        "destination": flight_data.get("disrupted_flight", {}).get("destination", "BOM")
    }

    processed_results = []
    for passenger in passengers:
        result = agent_engine.process_passenger(
            passenger=passenger,
            disruption_event=disruption_event,
            alternative_flights=alternative_flights
        )
        processed_results.append(result)

    # Sort results: Urgent cases first, then high value loyalty, then alphabetical
    processed_results.sort(
        key=lambda x: (
            not x["urgency_flag"],
            0 if x["loyalty_tier"] == "Platinum" else (1 if x["loyalty_tier"] == "Gold" else 2),
            x["name"]
        )
    )

    summary = {
        "disruption_event": disruption_event,
        "total_passengers": len(processed_results),
        "urgent_count": sum(1 for p in processed_results if p["urgency_flag"]),
        "connecting_count": sum(1 for p in processed_results if p["has_connection"]),
        "special_needs_count": sum(1 for p in processed_results if p["special_needs"] is not None),
        "processed_at": payload.get("timestamp") or "Just now"
    }

    return {
        "summary": summary,
        "results": processed_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
