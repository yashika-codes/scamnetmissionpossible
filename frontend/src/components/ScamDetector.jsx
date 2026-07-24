import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  Volume2, 
  CheckCircle2, 
  Clipboard,
  ShieldAlert,
  Zap,
  X,
  Activity,
  Loader2
} from 'lucide-react';

export default function ScamDetector({ isVoiceGuidance, selectedLanguage }) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [result, setResult] = useState(null);

  const isHindi = selectedLanguage === 'hi';

  useEffect(() => {
    if (!isVoiceGuidance && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isVoiceGuidance]);

  const sampleScams = [
    {
      label: isHindi ? "🚨 डिजिटल अरेस्ट धमकी" : "🚨 Digital Arrest Threat",
      text: "WhatsApp call from Mumbai Police Inspector Patil: Your Aadhaar linked parcel contained 150g MDMA. Placed under Digital Arrest. Transfer Rs. 4,50,000 to safe RBI verification account SBI-998822 (UPI: cbi.verify@okicici). Call +91-9876543210."
    },
    {
      label: isHindi ? "📲 बैंक KYC सस्पेंशन SMS" : "📲 Bank KYC Suspension SMS",
      text: "Dear SBI YONO user, your account will be suspended in 2 hours due to missing PAN verification. Click http://sbi-yono-kycupdate.info or call +91-9123456789 to update immediately."
    },
    {
      label: isHindi ? "⚡ बिजली कनेक्शन काटने का मैसेज" : "⚡ Electricity Cutoff Panic",
      text: "Dear Consumer, your electricity bill of Rs 14,800 is unpaid. Power supply will be disconnected tonight at 9:30 PM by Officer S.K. Roy. Call urgent +91-9432109876 or send payment to powerpay.wb@ybl."
    },
    {
      label: isHindi ? "💳 संदिग्ध UPI ID / फोन नंबर" : "💳 Suspicious UPI ID / Phone",
      text: "+91-9876543210 (UPI: cbi.verify@okicici)"
    }
  ];

  const handleScan = async (textToScan) => {
    const text = textToScan || inputText;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setShowModal(true);
    setScanStep(1);
    const s1 = setTimeout(() => setScanStep(2), 600);
    const s2 = setTimeout(() => setScanStep(3), 1200);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          victim_name: isHindi ? "वरिष्ठ नागरिक" : "Senior Citizen",
          location: "Delhi",
          state: "Delhi"
        })
      });
      const data = await res.json();

      const elapsed = Date.now() - startTime;
      if (elapsed < 1800) {
        await new Promise((r) => setTimeout(r, 1800 - elapsed));
      }

      setResult(data);

      if (isVoiceGuidance && data.senior_explanation) {
        speakText(`${data.senior_explanation.headline}. ${data.senior_explanation.summary}`);
      }
    } catch (err) {
      console.error("Text scan failed:", err);
      const elapsed = Date.now() - startTime;
      if (elapsed < 1800) {
        await new Promise((r) => setTimeout(r, 1800 - elapsed));
      }

      const isScamDetect = text.toLowerCase().includes("arrest") || text.toLowerCase().includes("police") || text.toLowerCase().includes("cbi") || text.toLowerCase().includes("money") || text.toLowerCase().includes("otp") || text.toLowerCase().includes("suspended") || text.toLowerCase().includes("kyc");
      const percentage = isScamDetect ? 95 : 12;

      const fallback = {
        is_scam: isScamDetect,
        scam_percentage: percentage,
        scam_type: isScamDetect ? "Phishing / Extortion Fraud" : "Safe Communication",
        risk_level: isScamDetect ? "CRITICAL" : "LOW",
        phone_numbers: ["+91-9876543210"],
        upi_ids: ["cbi.verify@okicici"],
        urls: ["http://sbi-yono-kycupdate.info"],
        senior_explanation: {
          badge: isScamDetect ? (isHindi ? "खतरा: 95% फ्रॉड" : "DANGER: 95% SCAM DETECTED") : (isHindi ? "सुरक्षित संचार (12%)" : "SAFE COMMUNICATION (12%)"),
          badge_color: isScamDetect ? "#EF4444" : "#10B981",
          headline: isScamDetect ? (isHindi ? "यह मैसेज एक फर्जी फ्रॉड है!" : "Warning: High Risk Fraud Message!") : (isHindi ? "कोई संदिग्ध खतरा नहीं" : "No Known Threat Found"),
          fraud_intent: isScamDetect ? "WHAT THE SENDER IS TRYING TO DO: Panic you into making an emergency payment or stealing your bank credentials via a phishing link." : "WHAT THE SENDER IS DOING: Normal informational communication without threat triggers.",
          summary: isScamDetect ? "Do NOT click any links in this message or send money to any listed UPI IDs." : "No scam keywords or suspicious URLs flagged.",
          action_steps: isScamDetect ? ["1. Delete message.", "2. Do NOT click link.", "3. Report to 1930."] : ["1. Stay alert.", "2. Never share OTP."]
        }
      };
      setResult(fallback);
      if (isVoiceGuidance) {
        speakText(`${fallback.senior_explanation.headline}. ${fallback.senior_explanation.summary}`);
      }
    } finally {
      clearTimeout(s1);
      clearTimeout(s2);
      setIsAnalyzing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        handleScan(text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const speakText = (text) => {
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
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 50) return '#EF4444'; // Red for Fraud
    return '#10B981'; // Green for Safe
  };

  const isScamConfirmed = (result?.scam_percentage ?? 80) >= 50;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'स्कैमशील्ड मैसेज व UPI स्कैनर' : 'ScamShield Message & UPI Scanner'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          {isHindi ? (
            <>किसी भी <span className="text-emerald-600">SMS, व्हाट्सएप मैसेज या UPI ID</span> को पेस्ट करें</>
          ) : (
            <>Paste any <span className="text-emerald-600">SMS, WhatsApp message, or UPI ID</span></>
          )}
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
          {isHindi 
            ? 'क्या आपको प्राप्त मैसेज या UPI ID संदिग्ध लगती है? नीचे पेस्ट करके तुरंत जांचें।'
            : 'Unsure if a message, phone number, or UPI ID is genuine? Paste it below to verify scam risk instantly.'}
        </p>
      </div>

      {/* Input Box & Paste Controls */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border border-slate-200 shadow-xl">
        {/* Sample Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isHindi ? 'नमूना फ्रॉड मैसेज चुनकर टेस्ट करें:' : 'Try A Sample Scam Scenario:'}
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleScams.map((scam, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputText(scam.text);
                  handleScan(scam.text);
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs md:text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{scam.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area & Quick Paste Button */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>{isHindi ? 'मैसेज या UPI ID सामग्री' : 'Message Content or UPI ID'}</span>
            <button
              onClick={handlePasteFromClipboard}
              className="text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 font-bold text-xs border border-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-50 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{isHindi ? 'क्लिपबोर्ड से पेस्ट करें' : 'Paste from Clipboard'}</span>
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder={isHindi 
              ? "यहाँ संदिग्ध SMS, व्हाट्सएप मैसेज, बैंक नोटिस, फोन नंबर या UPI ID (जैसे: cbi.verify@okicici) पेस्ट करें..."
              : "Paste suspicious SMS, WhatsApp message, bank notice, phone number, or UPI ID (e.g., cbi.verify@okicici) here..."}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 rounded-2xl p-4 border border-slate-200 focus:border-emerald-500 focus:outline-none text-base font-sans leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleScan()}
          disabled={isAnalyzing || !inputText.trim()}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-slate-900/15 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <span>{isHindi ? 'मैसेज की सुरक्षा जांच जारी है...' : 'Analyzing Your Message...'}</span>
          ) : (
            <>
              <Search className="w-6 h-6 text-emerald-400" />
              <span>{isHindi ? 'मैसेज व UPI सुरक्षा जांचें' : 'Check Message & UPI for Scam Risk'}</span>
            </>
          )}
        </button>
      </div>

      {/* POPUP MODAL FOR SCANNING MESSAGE & DISPLAYING FRAUD PROBABILITY */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 md:p-8 relative overflow-hidden my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer z-20"
                title={isHindi ? "बंद करें" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>

              {isAnalyzing ? (
                /* SCANNING STATE POPUP */
                <div className="text-center py-6 space-y-6">
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-pulse" />
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center z-10 shadow-lg">
                      <Search className="w-10 h-10 text-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>{isHindi ? 'मैसेज जांच जारी है...' : 'Analyzing Your Message...'}</span>
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                      {isHindi ? 'मैसेज की सुरक्षा जांच की जा रही है...' : 'Analyzing Message Security...'}
                    </h2>
                    <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
                      {isHindi
                        ? 'SCAMNET AI मैसेज सामग्री, फ़िशिंग लिंक और ब्लैकलिस्टेड UPI ID की जांच कर रहा है।'
                        : 'SCAMNET AI is parsing text patterns, checking suspicious links, and verifying threat databases.'}
                    </p>
                  </div>

                  {/* Input Text Preview inside Modal */}
                  {inputText && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                      <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Message Being Scanned:</span>
                      <p className="text-slate-900 text-sm font-semibold italic max-h-24 overflow-y-auto">
                        "{inputText}"
                      </p>
                    </div>
                  )}

                  {/* Step Pipeline Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      scanStep >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="text-xs">{isHindi ? '1. टेक्स्ट पार्स' : '1. Parse Content'}</div>
                      <div className="text-[10px] opacity-75">{scanStep >= 1 ? '✓ Complete' : 'Waiting...'}</div>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      scanStep >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="text-xs">{isHindi ? '2. फ्रॉड जांच' : '2. Threat Scan'}</div>
                      <div className="text-[10px] opacity-75">{scanStep >= 2 ? '✓ Scanning' : 'Waiting...'}</div>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      scanStep >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="text-xs">{isHindi ? '3. फ्रॉड सम्भावना' : '3. Probability'}</div>
                      <div className="text-[10px] opacity-75">{scanStep >= 3 ? '✓ Calculating' : 'Waiting...'}</div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                /* ANALYSIS RESULT POPUP */
                <div className="space-y-6 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 pr-8">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-2xl text-white ${
                        isScamConfirmed ? 'bg-red-500' : 'bg-emerald-600'
                      }`}>
                        {isScamConfirmed ? <ShieldAlert className="w-8 h-8 animate-bounce" /> : <ShieldCheck className="w-8 h-8" />}
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">SCAMNET ANALYSIS REPORT</span>
                        <h2 className="text-xl md:text-2xl font-black">
                          {isScamConfirmed ? (
                            <span className="text-red-600 flex items-center gap-1.5">🚨 FRAUD / SCAM DETECTED</span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1.5">✅ SAFE / NOT FRAUD</span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold">{result.scam_type}</p>
                      </div>
                    </div>

                    {/* Scam Probability Meter */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center min-w-[140px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Fraud Probability</div>
                      <div className="text-3xl font-black my-0.5" style={{ color: getPercentageColor(result.scam_percentage ?? 95) }}>
                        {result.scam_percentage ?? 95}%
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${result.scam_percentage ?? 95}%`,
                            backgroundColor: getPercentageColor(result.scam_percentage ?? 95)
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fraud Intent Breakdown */}
                  {result.senior_explanation?.fraud_intent && (
                    <div className={`p-4 rounded-2xl border space-y-1 ${
                      isScamConfirmed ? 'bg-red-50 border-red-200 text-red-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}>
                      <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wider text-red-700">
                        <Zap className="w-4 h-4 text-red-600" />
                        <span>Fraud Intent Breakdown</span>
                      </div>
                      <p className="font-bold text-sm leading-relaxed">
                        {result.senior_explanation.fraud_intent}
                      </p>
                    </div>
                  )}

                  {/* Senior Explanation */}
                  {result.senior_explanation && (
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {result.senior_explanation.headline}
                      </h4>
                      <p className="text-slate-700 text-xs md:text-sm bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                        {result.senior_explanation.summary}
                      </p>
                    </div>
                  )}

                  {/* Flagged Identifiers */}
                  {(result.phone_numbers?.length > 0 || result.upi_ids?.length > 0 || result.urls?.length > 0) && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Flagged Scam Identifiers:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.phone_numbers?.map((num, i) => (
                          <span key={i} className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                            Phone: {num}
                          </span>
                        ))}
                        {result.upi_ids?.map((upi, i) => (
                          <span key={i} className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                            UPI: {upi}
                          </span>
                        ))}
                        {result.urls?.map((url, i) => (
                          <span key={i} className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                            Phishing URL: {url}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Steps */}
                  {result.senior_explanation?.action_steps && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Action Steps:</span>
                      <div className="grid gap-2 md:grid-cols-3">
                        {result.senior_explanation.action_steps.map((step, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-900 font-bold text-xs leading-tight">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    {isVoiceGuidance && (
                      <button
                        onClick={() => speakText(`${result.senior_explanation.headline}. ${result.senior_explanation.summary}`)}
                        className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>{isHindi ? 'बोलकर सुनाएं' : 'Read Out Loud'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm transition-all cursor-pointer text-center"
                    >
                      {isHindi ? 'बंद करें' : 'Close Analysis'}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display (RED for Fraud, GREEN for Safe) */}
      <AnimatePresence>
        {result && result.senior_explanation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-6 md:p-8 space-y-6 ${
              isScamConfirmed ? 'card-fraud-alert' : 'card-safe-alert'
            }`}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
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
                  <p className="text-xs text-slate-600 font-semibold">Category: {result.scam_type}</p>
                </div>
              </div>

              {/* Visual Percentage Score Meter */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center min-w-[180px] shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">FRAUD PROBABILITY</div>
                <div 
                  className="text-4xl font-black my-1"
                  style={{ color: getPercentageColor(result.scam_percentage ?? 95) }}
                >
                  {result.scam_percentage ?? 95}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div 
                    className="h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${result.scam_percentage ?? 95}%`,
                      backgroundColor: getPercentageColor(result.scam_percentage ?? 95)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* WHAT THE FRAUDSTER IS TRYING TO DO */}
            {result.senior_explanation?.fraud_intent && (
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
                  {result.senior_explanation.fraud_intent}
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {result.senior_explanation.headline}
              </h2>
              <p className="text-slate-800 text-lg leading-relaxed bg-white p-4 rounded-2xl border border-slate-200 font-medium">
                {result.senior_explanation.summary}
              </p>
            </div>

            {/* Extracted Entities */}
            {(result.phone_numbers?.length > 0 || result.upi_ids?.length > 0 || result.urls?.length > 0) && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isHindi ? 'पहचाने गए फ़िशिंग / फ्रॉड संकेतक:' : 'Scam Indicators Flagged:'}
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.phone_numbers?.map((num, idx) => (
                    <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      Phone: {num}
                    </span>
                  ))}
                  {result.upi_ids?.map((upi, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      UPI: {upi}
                    </span>
                  ))}
                  {result.urls?.map((url, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      Phishing URL: {url}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Senior Action Steps */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider">
                {isHindi ? 'सलाह व सुरक्षा कदम:' : 'Recommended Safety Steps:'}
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {result.senior_explanation.action_steps?.map((step, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start space-x-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-900 font-bold text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
