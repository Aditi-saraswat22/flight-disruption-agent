# Flight Disruption Agent — Build Guide

## Project Purpose
This is a prototype "agentic AI" tool built for an internship application to **AIONOS** (a joint venture between InterGlobe Enterprises, which owns IndiGo airline, and Assago Ventures — AIONOS builds agentic AI products like IntelliMate for travel, aviation, logistics, hospitality and telecom).

The tool simulates how an airline operations team could handle a flight disruption (delay or cancellation): it identifies affected passengers, reasons about the best rebooking option for each, drafts a personalized passenger communication grounded in a real policy document, flags urgent cases needing human attention, and displays everything on an operations dashboard.

**This must feel "agentic," not just like a single prompt-in/response-out wrapper.** The core requirement is a multi-step reasoning chain per passenger:
1. Identify if this passenger has a connecting flight at risk
2. Evaluate available alternative flights and pick the best one
3. Check urgency (missed connection, special needs, etc.) and flag if a human should intervene
4. Retrieve relevant airline policy (via RAG) and draft a grounded, personalized message referencing it

---

## Tech Stack
- **Backend:** Python 3.11+ with FastAPI
- **Frontend:** React (Vite) + Tailwind CSS
- **LLM:** Anthropic Claude API (via the `anthropic` Python SDK)
- **Vector store (for RAG over policy docs):** ChromaDB, running locally/embedded — no separate server needed
- **Data:** all data is synthetic/fabricated (no real IndiGo or AIONOS data). This must be stated clearly in the README.

---

## Folder Structure
```
flight-disruption-agent/
├── backend/
│   ├── venv/                     # python virtual environment
│   ├── main.py                   # FastAPI app entrypoint
│   ├── agent.py                  # core reasoning agent logic
│   ├── rag.py                    # embedding + retrieval logic for policy docs
│   ├── data/
│   │   ├── passengers.json       # synthetic passenger list
│   │   ├── flights.json          # synthetic flight/alternative options
│   │   └── policy.md             # synthetic airline disruption policy doc
│   ├── requirements.txt
│   └── .env                      # holds ANTHROPIC_API_KEY (never commit this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── DisruptionForm.jsx
│   │   │   ├── PassengerTable.jsx
│   │   │   └── PassengerDetail.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## Step 1 — Prerequisites (Windows)
Confirm these are installed (run in PowerShell):
```powershell
python --version
pip --version
node --version
npm --version
git --version
```
If Python is missing, install from https://www.python.org/downloads/ and **check "Add python.exe to PATH"** during install.
If Node is missing, install the LTS version from https://nodejs.org.

---

## Step 2 — Backend environment setup
```powershell
mkdir flight-disruption-agent
cd flight-disruption-agent
mkdir backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn python-dotenv anthropic chromadb pydantic
pip freeze > requirements.txt
```

Create `.env` in `backend/`:
```
ANTHROPIC_API_KEY=your_key_here
```

---

## Step 3 — Create synthetic data

### `backend/data/passengers.json`
A list of ~15-20 fabricated passengers with fields: `id`, `name`, `seat`, `current_flight`, `has_connection` (bool), `connection_flight` (nullable), `connection_departure_time` (nullable), `special_needs` (bool/description).

### `backend/data/flights.json`
The disrupted flight plus 3-4 alternative flight options, each with: `flight_number`, `departure_time`, `arrival_time`, `available_seats`.

### `backend/data/policy.md`
A short fabricated airline disruption policy: compensation rules (e.g. "delays over 3 hours = meal voucher, over 6 hours = hotel accommodation"), rebooking priority rules (e.g. connecting passengers rebooked first, special needs passengers handled with priority), and communication tone guidelines.

---

## Step 4 — Basic FastAPI app (`backend/main.py`)
Set up a FastAPI app with CORS enabled for the React frontend (`http://localhost:5173`). Start with a health check endpoint:
```python
@app.get("/api/test")
def test():
    return {"message": "Backend is alive"}
```
Run with:
```powershell
uvicorn main:app --reload
```
Confirm `http://localhost:8000/api/test` returns the message.

---

## Step 5 — RAG layer over the policy doc (`backend/rag.py`)
- Split `policy.md` into small chunks (by paragraph or heading section).
- Embed each chunk (Claude does not provide embeddings directly — use a simple open-source embedding model via `sentence-transformers`, or chunk-match with basic keyword/cosine similarity if you want to avoid extra dependencies).
- Store chunks + embeddings in a local ChromaDB collection.
- Write a `retrieve_relevant_policy(query: str, k=2)` function that returns the top-k most relevant policy chunks for a given query (e.g. "compensation for a 4 hour delay").

---

## Step 6 — Core reasoning agent (`backend/agent.py`)
Write a function `process_passenger(passenger, disruption_event, alternative_flights, policy_context)` that:
1. Builds a structured prompt for Claude describing the passenger's situation, the disruption, and available alternatives.
2. Instructs Claude to reason step-by-step (in its response) through: connection risk → best rebooking option → urgency level → drafted passenger message referencing the retrieved policy context.
3. Instructs Claude to respond **only in JSON** with fields: `recommended_flight`, `reasoning`, `urgency_flag` (true/false), `urgency_reason`, `drafted_message`.
4. Parses and returns this JSON (strip markdown code fences before `json.loads`).

Loop this function over every passenger in `passengers.json` for a given disruption event, and sort results by `urgency_flag` (urgent first).

---

## Step 7 — API endpoints (`backend/main.py`)
- `POST /api/simulate-disruption` — accepts a disruption event (flight number + reason + new time or "cancelled"), runs `process_passenger` for every affected passenger, returns the full ranked list as JSON.
- `GET /api/passengers` — returns the raw passenger list (for the frontend to display before simulation).

---

## Step 8 — Frontend setup
```powershell
cd ../
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Configure Tailwind (`tailwind.config.js` content paths, add Tailwind directives to `index.css`).

Run with:
```powershell
npm run dev
```

---

## Step 9 — Frontend components
- **DisruptionForm.jsx:** a simple form to pick/enter a disrupted flight and reason, with a "Simulate Disruption" button that calls `POST /api/simulate-disruption`.
- **PassengerTable.jsx:** displays returned passengers sorted by urgency, with columns: name, recommended flight, urgency flag (color-coded), and an expand button.
- **PassengerDetail.jsx:** expanded view showing the agent's full reasoning and the drafted passenger message.
- **App.jsx:** ties these together, holds simulation results in state, shows a summary bar (total affected, urgent count).

---

## Step 10 — Deployment
- Backend: deploy to Render or Railway (free tier). Set `ANTHROPIC_API_KEY` as an environment variable in the platform's dashboard, not in code.
- Frontend: deploy to Vercel, pointing API calls at the deployed backend URL.

---

## Step 11 — README.md (for the GitHub repo)
Must include:
- One-paragraph problem statement and why it's relevant to AIONOS (aviation/travel focus via InterGlobe/IndiGo).
- Explicit note that all passenger/flight/policy data is synthetic.
- Architecture diagram (even simple ASCII or a drawn image) showing: React frontend → FastAPI backend → Claude API + ChromaDB.
- Tech stack list.
- Setup/run instructions.
- A link to a 60-90 second demo video (Loom or similar) showing a disruption simulated live and the agent's reasoning chain.

---

## Notes for whoever implements this
- Keep the UI functional and clean over visually elaborate — the reasoning quality matters more than polish.
- Every passenger's output must show *why* (the reasoning), not just the final recommendation — this is what makes it "agentic" rather than a lookup table.
- Do not fabricate real airline names, real flight numbers of real carriers, or claim this uses real AIONOS/IndiGo data anywhere.
