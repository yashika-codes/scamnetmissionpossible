# SCAMNET — India's Missing Fraud-Defense Layer

SCAMNET is a dual-view AI-powered fraud defense system built for India. It bridges the gap between elder citizen protection ("Guardian Layer") and cross-state cyber-crime analytics ("Intelligence Layer").

---

## 🌟 Key Features

### 1. Guardian Layer (Senior Citizen & Elder-Facing UI)
- **Voice-First Reporting**: Large interactive glowing microphone visualizer with live speech-to-text recording, audio analysis, and plain-English scam explanation output.
- **ScamShield Scanner**: Paste area & 1-click preset testing for SMS, WhatsApp messages, bank notices, or digital arrest threats.
- **SafePay Guard**: Real-time UPI payment safety engine that checks handles against national cyber cell databases before transfer.
- **AI Family Circle**: Emergency trust contact manager to dispatch instant alerts to family members when high-risk extortion is detected.
- **Senior Accessibility Suite**: Top persistent bar with **Large Text Mode**, **High Contrast Mode**, **Voice Guidance TTS**, and **Regional Language Selector** (Hindi, Bengali, Malayalam, Tamil, English).

### 2. Intelligence Layer (Cyber-Cell & Bank Dashboard)
- **FastAPI Entity Extraction**: Gemini AI & NLP pipeline extracting Phone Numbers, UPI IDs, Bank Names, Phishing URLs, and Phrasing Patterns.
- **NetworkX Fraud Graph & Clustering Engine**: Links complaints sharing identical phones or UPI handles across states (Delhi, West Bengal, Kerala, Maharashtra).
- **Interactive Criminal Ring Topology**: Visual SVG node graph rendering nodes, degree centrality, risk levels, and inter-state scam syndicate alerts.

---

## 🛠 Tech Stack

- **Backend**: Python 3.12+, FastAPI, NetworkX (Graph Analytics), Pydantic, Uvicorn
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **AI Services**: Google Gemini API (`google-generativeai`), OpenAI Whisper API (with seamless offline rule-based fallbacks)
- **Database/State**: In-Memory NetworkX Graph populated with synthetic seed complaint data

---

## 📁 Project File Structure

```
SCAMNET/
├── backend/
│   ├── main.py                # FastAPI server, CORS, REST endpoints
│   ├── config.py              # Environment variables & API keys
│   ├── mock_data.py           # Synthetic cross-state seed complaints
│   ├── requirements.txt       # Python dependencies
│   └── services/
│       ├── gemini_service.py  # Gemini entity extraction & plain-English advice
│       ├── whisper_service.py # Speech-to-text processing
│       └── graph_service.py   # NetworkX fraud graph & clustering engine
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with Senior Accessibility toggles
│   │   │   ├── VoiceGuardian.jsx   # Micro-interaction glowing mic recorder
│   │   │   ├── ScamDetector.jsx    # Text/message scanner UI with advice cards
│   │   │   ├── SafePayDemo.jsx     # UPI safety simulator & risk meter
│   │   │   ├── FamilyCircle.jsx    # Emergency family trust network manager
│   │   │   └── GraphDashboard.jsx  # Interactive fraud graph & cyber cell map
│   │   ├── App.jsx                 # View switcher (Guardian vs Intelligence)
│   │   ├── main.jsx                # React root entry point
│   │   └── index.css               # Tailwind CSS & custom design tokens
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Step 1: Clone & Configure Environment (Optional Keys)
Copy `.env.example` or set your keys in `backend/config.py`:
```env
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key" # Optional for Whisper
```
*Note: If no API key is provided, SCAMNET automatically uses its intelligent local rule engine so all features and graphs work out-of-the-box.*

### Step 2: Start Python FastAPI Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Launch FastAPI server
python -m uvicorn backend.main:app --reload --port 8000
```
Backend API will run at `http://127.0.0.1:8000` (Docs available at `http://127.0.0.1:8000/docs`).

### Step 3: Start React Frontend
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🎯 Verification & Demonstration Steps

1. **Test Voice Guardian**: Click **Guardian View** -> Tap the big glowing microphone -> Speak or select `"Digital Arrest Call Sample"` -> Watch SCAMNET parse the threat and read out plain-English advice.
2. **Test ScamShield Scanner**: Click **ScamShield Scanner** -> Select `"Digital Arrest Threat"` or `"Bank KYC Suspension"` sample -> Click **Check Message for Scam Risk**.
3. **Test SafePay Guard**: Enter `cbi.verify@okicici` or `sbisecure.kyc@okaxis` -> Observe the **CRITICAL DANGER** alert and cross-state complaint linkage.
4. **Test Cyber-Cell Intelligence Layer**: Switch top toggle to **Intelligence Layer** -> Explore the live SVG node graph topology, filter by entity type, and inspect active criminal syndicates spanning Delhi, West Bengal, and Kerala.
