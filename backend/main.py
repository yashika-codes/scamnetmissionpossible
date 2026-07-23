import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from backend.config import HOST, PORT
from backend.services.gemini_service import analyze_scam_text
from backend.services.whisper_service import transcribe_audio
from backend.services.graph_service import fraud_graph_service

app = FastAPI(
    title="SCAMNET API",
    description="Backend API for SCAMNET — India's Missing Fraud-Defense Layer",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request Schemas ---
class AnalyzeTextRequest(BaseModel):
    text: str
    victim_name: Optional[str] = "Senior Citizen User"
    location: Optional[str] = "India"
    state: Optional[str] = "Delhi"

class SafePayRequest(BaseModel):
    target: str # Phone number or UPI ID

class FamilyAlertRequest(BaseModel):
    scam_title: str
    victim_name: str
    contact_phone: str
    details: str


# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "SCAMNET Fraud Intelligence Engine",
        "nodes_count": len(fraud_graph_service.graph.nodes),
        "edges_count": len(fraud_graph_service.graph.edges)
    }

@app.post("/api/analyze-text")
async def analyze_text(req: AnalyzeTextRequest):
    """
    Analyzes raw SMS / WhatsApp / call transcript using Gemini API (or rule fallback),
    extracts entities, updates NetworkX fraud graph, and returns senior-friendly explanation.
    """
    analysis = await analyze_scam_text(req.text)

    # Generate a unique complaint ID if high risk or contains entities
    if analysis.get("phone_numbers") or analysis.get("upi_ids") or analysis.get("risk_level") in ["HIGH", "CRITICAL"]:
        cmp_id = f"CMP-2026-{len(fraud_graph_service.complaints) + 9001}"
        new_cmp = {
            "id": cmp_id,
            "victim_name": req.victim_name,
            "victim_location": req.location,
            "state": req.state,
            "scam_type": analysis.get("scam_type", "Scam"),
            "raw_text": req.text,
            "phone_numbers": analysis.get("phone_numbers", []),
            "upi_ids": analysis.get("upi_ids", []),
            "bank_names": analysis.get("bank_names", []),
            "urls": analysis.get("urls", []),
            "amount_lost": 0,
            "timestamp": "Just now",
            "risk_level": analysis.get("risk_level", "HIGH")
        }
        fraud_graph_service.add_complaint(new_cmp)

    return analysis


@app.post("/api/analyze-voice")
async def analyze_voice(
    file: Optional[UploadFile] = File(None),
    transcript: Optional[str] = Form(None),
    state: Optional[str] = Form("Delhi")
):
    """
    Accepts voice audio upload or direct browser speech transcription.
    Transcribes audio via Whisper API and analyzes scam entities.
    """
    if file:
        audio_bytes = await file.read()
        transcribed_text = await transcribe_audio(audio_bytes, file.filename)
    elif transcript:
        transcribed_text = transcript
    else:
        raise HTTPException(status_code=400, detail="No audio file or transcript provided")

    # Run analysis
    analysis = await analyze_scam_text(transcribed_text)
    analysis["transcript"] = transcribed_text

    # Auto-link to graph
    if analysis.get("phone_numbers") or analysis.get("upi_ids"):
        cmp_id = f"CMP-2026-{len(fraud_graph_service.complaints) + 9001}"
        new_cmp = {
            "id": cmp_id,
            "victim_name": "Voice Report User",
            "victim_location": "Elder Guardian",
            "state": state or "Delhi",
            "scam_type": analysis.get("scam_type", "Voice Scam"),
            "raw_text": transcribed_text,
            "phone_numbers": analysis.get("phone_numbers", []),
            "upi_ids": analysis.get("upi_ids", []),
            "bank_names": analysis.get("bank_names", []),
            "urls": analysis.get("urls", []),
            "amount_lost": 0,
            "timestamp": "Just now",
            "risk_level": analysis.get("risk_level", "CRITICAL")
        }
        fraud_graph_service.add_complaint(new_cmp)

    return analysis


@app.get("/api/graph")
def get_graph():
    """
    Returns full NetworkX graph data, cluster alerts, and summary metrics for Intelligence View.
    """
    return fraud_graph_service.get_graph_data()


@app.post("/api/safepay-check")
def check_safepay(req: SafePayRequest):
    """
    SafePay Guard endpoint: Checks phone number or UPI handle against cross-state fraud graph.
    """
    return fraud_graph_service.check_entity_risk(req.target)


@app.post("/api/family-alert")
def send_family_alert(req: FamilyAlertRequest):
    """
    Simulates sending an immediate WhatsApp / SMS emergency panic alert to family members.
    """
    return {
        "status": "SENT",
        "recipient": req.contact_phone,
        "message": f"🚨 EMERGENCY SCAM ALERT for {req.victim_name}: Suspected '{req.scam_title}' attempt detected! Details: {req.details}",
        "timestamp": "Instant Dispatch"
    }


@app.post("/api/seed-reset")
def reset_seed_data():
    """Resets graph to default seed complaints."""
    fraud_graph_service.reset_graph()
    return {"status": "SUCCESS", "message": "Fraud Graph reset to initial cross-state seed data."}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
