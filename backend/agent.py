import os
import json
import datetime
from typing import Dict, Any, List
from rag import rag_engine, get_policy_context

def parse_iso_datetime(dt_str: str) -> datetime.datetime:
    try:
        return datetime.datetime.fromisoformat(dt_str)
    except Exception:
        return datetime.datetime.now()

class FlightDisruptionAgent:
    """
    Agentic AI engine executing a 4-step reasoning chain per passenger:
    Step 1: Connection Risk Assessment
    Step 2: Rebooking Candidate Scoring & Selection
    Step 3: Urgency & Human Escalation Evaluation
    Step 4: RAG Policy Retrieval & Grounded Communication Drafting
    """
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        if self.anthropic_key == "your_anthropic_api_key_here":
            self.anthropic_key = ""

    def process_passenger(
        self,
        passenger: Dict[str, Any],
        disruption_event: Dict[str, Any],
        alternative_flights: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        delay_minutes = int(disruption_event.get("delay_minutes", 180))
        disruption_type = disruption_event.get("type", "delay") # "delay" or "cancellation"
        reason = disruption_event.get("reason", "Severe Technical Inspection & Weather Alert")
        
        # --- Step 1: Connection Risk Assessment ---
        sched_arrival = parse_iso_datetime(passenger.get("scheduled_arrival_time", "2026-09-19T13:15:00"))
        revised_arrival = sched_arrival + datetime.timedelta(minutes=delay_minutes)
        
        has_connection = passenger.get("has_connection", False)
        connection_risk = "NO CONNECTION"
        buffer_minutes = 999
        
        if has_connection and passenger.get("connection_departure_time"):
            conn_dept = parse_iso_datetime(passenger["connection_departure_time"])
            buffer_minutes = int((conn_dept - revised_arrival).total_seconds() / 60)
            
            if buffer_minutes < 0:
                connection_risk = "MISSED CONNECTION (Definite)"
            elif buffer_minutes < 45:
                connection_risk = f"CRITICAL RISK ({buffer_minutes}m layover remaining)"
            elif buffer_minutes < 90:
                connection_risk = f"MODERATE RISK ({buffer_minutes}m layover remaining)"
            else:
                connection_risk = f"SAFE ({buffer_minutes}m layover remaining)"
                
        # --- Step 2: Alternative Flight Selection ---
        target_destination = passenger.get("connection_destination") or disruption_event.get("destination", "BOM")
        
        # Match options
        suitable_options = []
        for flight in alternative_flights:
            if flight.get("available_seats", 0) > 0:
                suitable_options.append(flight)
                
        recommended_flight = None
        if suitable_options:
            # Pick first matching or direct flight
            recommended_flight = suitable_options[0]
            for flight in suitable_options:
                if passenger.get("cabin_class") in flight.get("cabin_classes", []):
                    recommended_flight = flight
                    break

        rebook_summary = (
            f"Rebooked on {recommended_flight['flight_number']} ({recommended_flight['airline']}) "
            f"departing at {recommended_flight['departure_time'][-8:-3]}"
        ) if recommended_flight else "No direct seats available; requesting partner interline allocation."

        # --- Step 3: Urgency & Escalation Flag ---
        special_needs = passenger.get("special_needs")
        loyalty = passenger.get("loyalty_tier", "Regular")
        urgency_flag = False
        urgency_reasons = []

        if special_needs:
            urgency_flag = True
            urgency_reasons.append(f"Special Needs: {special_needs}")

        if "MISSED" in connection_risk or "CRITICAL" in connection_risk:
            urgency_flag = True
            urgency_reasons.append(f"Tight/Missed Connection ({connection_risk})")

        if delay_minutes >= 240:
            urgency_reasons.append(f"Extended Delay ({delay_minutes // 60} hours)")

        if loyalty in ["Platinum", "Gold"]:
            urgency_reasons.append(f"High Value Loyalty Member ({loyalty})")

        urgency_reason_str = " | ".join(urgency_reasons) if urgency_reasons else "Standard handling, automated rebook confirmed."

        # --- Step 4: RAG Policy Retrieval & Message Drafting ---
        policy_query = f"Delay of {delay_minutes} minutes, {special_needs or 'regular passenger'}, {connection_risk}"
        policy_snippets = rag_engine.retrieve_relevant_policy(policy_query, top_k=2)
        
        retrieved_policy_text = "\n\n".join([f"[{p['title']}]: {p['content']}" for p in policy_snippets])

        # Entitlements calculation based on policy
        entitlements = []
        if delay_minutes >= 120 and delay_minutes < 240:
            entitlements.append("Complimentary Refreshment & Beverage Voucher (INR 500)")
        elif delay_minutes >= 240:
            entitlements.append("Full Meal Voucher (INR 1200) + Airport Lounge Pass")
        
        if delay_minutes >= 360 or "MISSED" in connection_risk:
            entitlements.append("Partner Hotel Accommodation & Airport Shuttle Transfer")

        if special_needs and "Unaccompanied Minor" in special_needs:
            entitlements.append("Dedicated Airport Ground Escort")

        entitlement_str = ", ".join(entitlements) if entitlements else "Standard flight transfer updates."

        # Draft personalized message
        p_name = passenger.get("name", "Valued Passenger")
        c_flight = passenger.get("current_flight", "6E-204")
        
        drafted_message = (
            f"Dear {p_name},\n\n"
            f"We sincerely apologize that flight {c_flight} has been disrupted due to {reason.lower()}. "
            f"To minimize inconvenience to your journey, our AI operations team has automatically rebooked you onto "
            f"flight {recommended_flight['flight_number'] if recommended_flight else 'our next available partner flight'}, "
            f"scheduled to depart at {recommended_flight['departure_time'][-8:-3] if recommended_flight else 'soon'}.\n\n"
            f"Per our Passenger Care Policy, you are entitled to: {entitlement_str}. "
            f"Please visit Customer Service Desk B or show this digital pass at the gate for assistance."
            + (f"\n\nNote: A ground agent has been dispatched to assist with your requirement ({special_needs})." if special_needs else "")
            + f"\n\nThank you for your patience.\nCustomer Operations Team"
        )

        reasoning_chain = {
            "step_1_connection_check": {
                "has_connection": has_connection,
                "connection_flight": passenger.get("connection_flight"),
                "buffer_minutes": buffer_minutes,
                "connection_risk": connection_risk,
                "analysis": f"Passenger has connecting flight {passenger.get('connection_flight') or 'None'}. Arrival delay of {delay_minutes} mins yields layover buffer of {buffer_minutes} mins."
            },
            "step_2_rebooking": {
                "recommended_flight": recommended_flight,
                "rebook_summary": rebook_summary,
                "scoring_notes": f"Selected flight {recommended_flight['flight_number'] if recommended_flight else 'None'} based on seat availability ({recommended_flight.get('available_seats', 0) if recommended_flight else 0} seats) and class alignment."
            },
            "step_3_urgency": {
                "urgency_flag": urgency_flag,
                "urgency_reason": urgency_reason_str,
                "requires_human": urgency_flag
            },
            "step_4_rag_and_message": {
                "retrieved_policies": policy_snippets,
                "entitlements": entitlements,
                "drafted_message": drafted_message
            }
        }

        return {
            "passenger_id": passenger["id"],
            "name": passenger["name"],
            "seat": passenger["seat"],
            "cabin_class": passenger.get("cabin_class", "Economy"),
            "loyalty_tier": passenger.get("loyalty_tier", "Regular"),
            "current_flight": passenger["current_flight"],
            "has_connection": has_connection,
            "connection_flight": passenger.get("connection_flight"),
            "special_needs": special_needs,
            "connection_risk": connection_risk,
            "recommended_flight": recommended_flight.get("flight_number") if recommended_flight else "TBD",
            "recommended_flight_details": recommended_flight,
            "urgency_flag": urgency_flag,
            "urgency_reason": urgency_reason_str,
            "entitlements": entitlements,
            "drafted_message": drafted_message,
            "reasoning_chain": reasoning_chain
        }

agent_engine = FlightDisruptionAgent()
