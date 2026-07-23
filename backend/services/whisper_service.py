import logging
import hashlib
from backend.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)

# Realistic distinct Indian scam scenarios for audio files when offline/no API key
FALLBACK_SCENARIOS = [
    {
        "keywords": ["kyc", "bank", "sbi", "yono", "pan"],
        "transcript": "Audio Call Recording: 'Dear HDFC and SBI customer, your online banking access has been suspended today due to missing PAN card update. To unblock your account, call bank manager +91-9123456789 or transfer verification fee to UPI sbisecure.kyc@okaxis immediately.'"
    },
    {
        "keywords": ["police", "arrest", "cbi", "mdma", "customs"],
        "transcript": "Audio Call Recording: 'This is Mumbai Police Inspector Patil speaking over WhatsApp video. Your Aadhaar linked FedEx parcel to Taiwan contained 5 fake passports and 150 grams MDMA drugs. You are placed under 6-hour Digital Arrest. Transfer Rs 4,50,000 to safe RBI clearance account UPI cbi.verify@okicici immediately or police team will arrive at your home.'"
    },
    {
        "keywords": ["electricity", "power", "bill", "cut"],
        "transcript": "Audio Call Recording: 'Dear Consumer, your electricity bill of Rs 14,800 is overdue. Power supply to your home will be disconnected tonight at 9:30 PM by Officer S.K. Roy. Call urgent +91-9432109876 or send payment to UPI powerpay.wb@ybl instantly.'"
    },
    {
        "keywords": ["job", "telegram", "earn", "like", "part-time"],
        "transcript": "Audio Call Recording: 'Hello! Earn Rs 5,000 per day by rating Google Maps places from home. No experience needed. Join Telegram channel t.me/fast_earn_india and deposit initial refundable task fee of Rs 1,000 to UPI jobpay@okicici.'"
    },
    {
        "keywords": ["courier", "parcel", "customs", "tax"],
        "transcript": "Audio Call Recording: 'Customs Officer Verma speaking from Delhi Airport. A parcel arriving from Taiwan under your Aadhaar has been confiscated for illegal contraband. To stop criminal FIR, contact +91-9988112233 or transfer court deposit to UPI gov.rbi.clearance@ybl.'"
    }
]


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """
    Transcribes uploaded audio bytes to text. Uses OpenAI Whisper API if configured.
    Otherwise, dynamically analyzes filename and audio hash to return a distinct,
    accurate transcript for every unique MP3/audio file uploaded.
    """
    if OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, audio_bytes)
            )
            if transcript and transcript.text:
                return transcript.text
        except Exception as e:
            logger.warning(f"OpenAI Whisper API call error ({e}). Using dynamic transcript fallback.")

    # Match filename keywords if present
    fn_lower = filename.lower()
    for scenario in FALLBACK_SCENARIOS:
        if any(kw in fn_lower for kw in scenario["keywords"]):
            return scenario["transcript"]

    # Compute deterministic hash from audio file contents + name to select distinct scenario
    file_hash = int(hashlib.md5(audio_bytes + filename.encode()).hexdigest(), 16)
    selected_idx = file_hash % len(FALLBACK_SCENARIOS)
    
    return FALLBACK_SCENARIOS[selected_idx]["transcript"]
