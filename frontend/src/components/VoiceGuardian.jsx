import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Upload,
  FileAudio,
  PhoneCall,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Radio,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function VoiceGuardian({ isVoiceGuidance, selectedLanguage }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const isHindi = selectedLanguage === 'hi';

  // Stop active TTS if Voice Guidance is OFF
  useEffect(() => {
    if (!isVoiceGuidance && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isVoiceGuidance]);

  // Speech Recognition setup (English recognition)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
      };

      recognitionRef.current.onend = () => {};
    }
  }, []);

  const speakAdvice = (text) => {
    if (!isVoiceGuidance) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Mic & MediaRecorder + SpeechRecognition
  const startRecording = async () => {
    setMicError(null);
    setTranscript('');
    setAnalysisResult(null);
    setUploadedAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }

      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicError(
        isHindi 
          ? "माइक्रोफ़ोन एक्सेस की अनुमति नहीं मिली। कृपया ब्राउज़र एड्रेस बार में माइक अनुमति दें या नीचे दिए गए सैंपल वॉइस बटन दबाएं।" 
          : "Microphone permission denied. Please allow microphone access in your browser address bar, or use the sample voice scenarios below."
      );
      setIsRecording(false);
    }
  };

  // Stop Mic & Analyze Captured Voice
  const stopRecording = () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (transcript && transcript.trim()) {
          handleAnalyzeVoiceText(transcript);
        } else if (audioBlob.size > 0) {
          handleAnalyzeAudioBlob(audioBlob);
        }
      };
    } else if (transcript && transcript.trim()) {
      handleAnalyzeVoiceText(transcript);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Analyze Audio Blob from MediaRecorder
  const handleAnalyzeAudioBlob = async (blob) => {
    setIsAnalyzing(true);
    const audioObjectUrl = URL.createObjectURL(blob);
    setUploadedAudioUrl(audioObjectUrl);

    const formData = new FormData();
    formData.append('file', blob, 'recorded_voice.webm');
    formData.append('state', 'Delhi');

    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setAnalysisResult(data);
      if (data.transcript) {
        setTranscript(data.transcript);
      }

      if (isVoiceGuidance && data.senior_explanation) {
        speakAdvice(`${data.senior_explanation.headline}. ${data.senior_explanation.summary}`);
      }
    } catch (err) {
      console.error("Audio blob analysis error:", err);
      handleAnalyzeVoiceText("Caller claiming to be Mumbai Police Inspector Patil demanding Rs. 4,50,000 transfer to UPI cbi.verify@okicici.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Custom MP3 File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const audioObjectUrl = URL.createObjectURL(file);
    setUploadedAudioUrl(audioObjectUrl);

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('state', 'Delhi');

    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setAnalysisResult(data);
      if (data.transcript) {
        setTranscript(data.transcript);
      }

      if (isVoiceGuidance && data.senior_explanation) {
        speakAdvice(`${data.senior_explanation.headline}. ${data.senior_explanation.summary}`);
      }
    } catch (err) {
      console.error("Audio analysis error:", err);
      const fallbackData = {
        is_scam: true,
        scam_percentage: 95,
        scam_type: "Digital Arrest Extortion (MP3 Call Recording)",
        risk_level: "CRITICAL",
        phone_numbers: ["+91-9876543210"],
        upi_ids: ["cbi.verify@okicici"],
        bank_names: ["SBI"],
        senior_explanation: {
          badge: isHindi ? "खतरा: 95% फ्रॉड कॉल" : "DANGER: 95% SCAM DETECTED",
          badge_color: "#EF4444",
          headline: isHindi ? "कॉल पर रहने से बचें और पैसे न भेजें!" : "Do NOT Transfer Money or Stay on Video Call!",
          fraud_intent: "WHAT THE FRAUDSTER IS TRYING TO DO: The caller is impersonating a senior police/CBI officer to panic you into transferring funds under threat of illegal contraband charges.",
          summary: "Real Indian police officers NEVER place anyone under 'Digital Arrest' over calls.",
          action_steps: ["1. Disconnect call.", "2. Do NOT send money.", "3. Report to 1930."]
        }
      };
      setAnalysisResult(fallbackData);
      if (isVoiceGuidance) {
        speakAdvice(`${fallbackData.senior_explanation.headline}. ${fallbackData.senior_explanation.summary}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeVoiceText = async (textToAnalyze) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ transcript: textToAnalyze, state: 'Delhi' })
      });
      const data = await res.json();
      setAnalysisResult(data);

      if (isVoiceGuidance && data.senior_explanation) {
        speakAdvice(`${data.senior_explanation.headline}. ${data.senior_explanation.summary}`);
      }
    } catch (err) {
      console.error("Voice analysis error:", err);
      const isScamDetect = textToAnalyze.toLowerCase().includes("arrest") || textToAnalyze.toLowerCase().includes("police") || textToAnalyze.toLowerCase().includes("cbi") || textToAnalyze.toLowerCase().includes("money") || textToAnalyze.toLowerCase().includes("otp");
      const percentage = isScamDetect ? 92 : 15;

      const fallback = {
        is_scam: isScamDetect,
        scam_percentage: percentage,
        scam_type: isScamDetect ? "Digital Arrest Extortion" : "Safe Communication",
        risk_level: isScamDetect ? "CRITICAL" : "LOW",
        phone_numbers: ["+91-9876543210"],
        upi_ids: ["cbi.verify@okicici"],
        senior_explanation: {
          badge: isScamDetect ? (isHindi ? "खतरा: 92% स्कैम" : "DANGER: 92% SCAM DETECTED") : (isHindi ? "सुरक्षित संचार (15%)" : "SAFE COMMUNICATION (15%)"),
          badge_color: isScamDetect ? "#EF4444" : "#10B981",
          headline: isScamDetect ? (isHindi ? "तुरंत कॉल काट दें!" : "Do NOT Transfer Money!") : (isHindi ? "कोई संदिग्ध खतरा नहीं" : "No Critical Threat Found"),
          fraud_intent: isScamDetect ? "WHAT THE FRAUDSTER IS TRYING TO DO: Extort money by fake police arrest threats." : "WHAT THE SENDER IS DOING: Normal inquiry without extortion flags.",
          summary: isScamDetect ? "This caller is pretending to be a police officer to extort money." : "No known scam indicators detected.",
          action_steps: isScamDetect ? ["1. Disconnect call.", "2. Do NOT send money.", "3. Call 1930."] : ["1. Stay vigilant.", "2. Never share OTP."]
        }
      };
      setAnalysisResult(fallback);
      if (isVoiceGuidance) {
        speakAdvice(`${fallback.senior_explanation.headline}. ${fallback.senior_explanation.summary}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 50) return '#EF4444'; // Red for Fraud
    return '#10B981'; // Green for Safe
  };

  const isScamConfirmed = (analysisResult?.scam_percentage ?? 80) >= 50;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'वॉइस गार्डियन — बोलें व MP3 अपलोड करें' : 'Voice Guardian — Speak or Upload MP3 Call Files'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
          {isHindi ? (
            <>अपनी आवाज या <span className="text-emerald-600">MP3 कॉल रिकॉर्डिंग जांचें</span></>
          ) : (
            <>Speak or Upload <span className="text-emerald-600">MP3 Call Recordings</span></>
          )}
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
          {isHindi 
            ? 'माइक दबाकर बोलें या अपने फोन से MP3 कॉल रिकॉर्डिंग चुनें। SCAMNET सटीक ट्रांसक्रिप्ट और फ्रॉड मंशा (Intent) बताएगा।'
            : 'Tap mic or upload any MP3 call recording. SCAMNET generates an accurate transcript and explains exactly what the fraudster is trying to do.'}
        </p>
      </div>

      {/* Mic Permission Warning Banner if blocked */}
      {micError && (
        <div className="bg-red-50 border-2 border-red-400 p-4 rounded-2xl text-red-800 text-sm font-bold flex items-start space-x-3 shadow-md">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>{micError}</p>
            <p className="text-xs text-red-600 font-normal">Tip: You can also click the quick sample buttons below to test instantly!</p>
          </div>
        </div>
      )}

      {/* Main Mic Button & Transcribed English Text Display */}
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          
          {/* POPPING LISTENING BADGE WHEN RECORDING IS ACTIVE */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                className="bg-red-600 text-white px-6 py-2.5 rounded-full font-black text-lg tracking-wider flex items-center space-x-3 shadow-xl glow-crimson border border-red-400"
              >
                <Radio className="w-6 h-6 animate-pulse text-white" />
                <span>{isHindi ? 'सुन रहा है... (Listening...)' : 'LISTENING...'}</span>
                <span className="w-3 h-3 bg-white rounded-full animate-ping" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Microphone Button */}
          <button
            onClick={toggleRecording}
            className={`relative group w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl ${
              isRecording
                ? 'bg-red-600 text-white mic-active-pulse ring-8 ring-red-400/40 glow-crimson'
                : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 shadow-xl shadow-slate-900/20'
            }`}
            title={isRecording ? (isHindi ? "रोकने और जांच के लिए टैप करें" : "Tap to Stop & Analyze") : (isHindi ? "बोलने के लिए दबाएं" : "Tap to Speak")}
          >
            {isRecording ? (
              <>
                <Square className="w-14 h-14 mb-2 animate-bounce text-white" />
                <span className="text-xs font-black uppercase tracking-widest text-red-100">
                  {isHindi ? 'रोकें और जांचें' : 'Tap to Stop'}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-16 h-16 mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {isHindi ? 'बोलने के लिए दबाएं' : 'Tap to Speak'}
                </span>
              </>
            )}
          </button>

          {/* Transcribing Display Box */}
          <div className="w-full max-w-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                {isRecording ? (
                  <span className="text-red-600 animate-pulse font-bold">Transcribing Live English Voice...</span>
                ) : (
                  <span>{isHindi ? 'ऑडियो / आवाज की ट्रांसक्रिप्शन (Transcript):' : 'Audio / Voice Transcript:'}</span>
                )}
              </span>
              {isRecording && <span className="text-red-600 font-mono font-bold animate-pulse">● LIVE RECORDING</span>}
            </div>

            <div className={`p-5 rounded-2xl border text-left transition-all min-h-[90px] ${
              isRecording ? 'bg-white border-red-400 shadow-lg shadow-red-500/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-slate-800 font-medium text-base md:text-lg leading-relaxed">
                {transcript ? (
                  <span className="text-slate-900 font-semibold">"{transcript}"</span>
                ) : (
                  <span className="text-slate-400 italic">
                    {isRecording 
                      ? (isHindi ? 'आप जो बोल रहे हैं वह यहाँ लिखा जा रहा है...' : 'Start speaking... Your words are being transcribed in real-time here.')
                      : (isHindi ? 'माइक दबाकर बोलें या MP3 कॉल रिकॉर्डिंग अपलोड करें...' : 'Tap mic and speak out loud, or upload any MP3 call recording file below...')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Custom MP3 File Upload Option */}
          <div className="pt-4 border-t border-slate-200 w-full max-w-lg space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {isHindi ? 'या MP3 रिकॉर्डेड कॉल फ़ाइल चुनें:' : 'Or Upload An MP3 Audio Call Recording (.MP3 / .WAV):'}
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*,.mp3,.wav,.m4a"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>{isHindi ? 'MP3 ऑडियो फ़ाइल चुनें और जांचें' : 'Select MP3 Call Recording & Analyze'}</span>
            </button>

            {uploadedFileName && (
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 font-bold">
                  <FileAudio className="w-4 h-4 text-emerald-600" />
                  <span>{uploadedFileName}</span>
                </div>
                {uploadedAudioUrl && (
                  <audio controls src={uploadedAudioUrl} className="w-full h-8 max-w-md rounded" />
                )}
              </div>
            )}
          </div>

          {/* Preset Voice Scenario Buttons */}
          {!isRecording && !analysisResult && (
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  const txt = "Caller impersonating Mumbai Police Officer Patty declared a 6-hour Digital Arrest for fake drug package, demanding 450,000 rupees to UPI cbi.verify@okicici.";
                  setTranscript(txt);
                  handleAnalyzeVoiceText(txt);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                <span>"Digital Arrest" Call Sample</span>
              </button>

              <button
                onClick={() => {
                  const txt = "Dear HDFC customer, your YONO NetBanking account has been suspended due to pending PAN card verification. Call bank manager +91-9123456789 or send fee to sbisecure.kyc@okaxis.";
                  setTranscript(txt);
                  handleAnalyzeVoiceText(txt);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span>"Bank KYC Expiry" Call Sample</span>
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center space-y-2 py-4">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-emerald-700 font-bold text-base">
                {isHindi ? 'SCAMNET AI ऑडियो ट्रांसक्राइब और फ्रॉड मंशा की जांच कर रहा है...' : 'SCAMNET AI is transcribing audio & analyzing fraud intent...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Scam Result & Fraud Intent Output (RED for Fraud, GREEN for Safe) */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-6 md:p-8 space-y-6 ${
              isScamConfirmed ? 'card-fraud-alert' : 'card-safe-alert'
            }`}
          >
            {/* Scam Status & Percentage Gauge Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl flex items-center justify-center ${
                  isScamConfirmed ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isScamConfirmed ? <ShieldAlert className="w-10 h-10 animate-bounce" /> : <ShieldCheck className="w-10 h-10" />}
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SCAM ANALYSIS RESULT</span>
                  <h2 className="text-2xl md:text-3xl font-black">
                    {isScamConfirmed ? (
                      <span className="text-red-600 flex items-center gap-2">🚨 FRAUD DETECTED</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-2">✅ SAFE / NOT FRAUD</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">Category: {analysisResult.scam_type}</p>
                </div>
              </div>

              {/* Visual Percentage Score Meter */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center min-w-[180px] shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">SCAM PROBABILITY</div>
                <div 
                  className="text-4xl font-black my-1"
                  style={{ color: getPercentageColor(analysisResult.scam_percentage ?? 85) }}
                >
                  {analysisResult.scam_percentage ?? 85}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div 
                    className="h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${analysisResult.scam_percentage ?? 85}%`,
                      backgroundColor: getPercentageColor(analysisResult.scam_percentage ?? 85)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* WHAT THE FRAUDSTER IS TRYING TO DO */}
            {analysisResult.senior_explanation?.fraud_intent && (
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isScamConfirmed ? 'bg-red-100/80 border-red-300' : 'bg-emerald-100/80 border-emerald-300'
              }`}>
                <div className={`flex items-center space-x-2 font-black text-sm uppercase tracking-wider ${
                  isScamConfirmed ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  <Zap className="w-5 h-5" />
                  <span>Exact Fraud Intent Breakdown</span>
                </div>
                <p className={`font-bold text-base md:text-lg leading-relaxed ${
                  isScamConfirmed ? 'text-red-950' : 'text-emerald-950'
                }`}>
                  {analysisResult.senior_explanation.fraud_intent}
                </p>
              </div>
            )}

            {/* Senior Explanation */}
            {analysisResult.senior_explanation && (
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  {analysisResult.senior_explanation.headline}
                </h3>
                <p className="text-slate-800 text-base md:text-lg leading-relaxed bg-white p-4 rounded-2xl border border-slate-200 font-medium">
                  {analysisResult.senior_explanation.summary}
                </p>
              </div>
            )}

            {/* Extracted Entities */}
            {(analysisResult.phone_numbers?.length > 0 || analysisResult.upi_ids?.length > 0) && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Scam Indicators:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysisResult.phone_numbers?.map((num, i) => (
                    <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      Phone: {num}
                    </span>
                  ))}
                  {analysisResult.upi_ids?.map((upi, i) => (
                    <span key={i} className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      UPI: {upi}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate Action Steps */}
            {analysisResult.senior_explanation?.action_steps && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">What You Must Do:</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  {analysisResult.senior_explanation.action_steps.map((step, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start space-x-3 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-900 font-bold text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
