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
  Zap
} from 'lucide-react';

export default function ScamDetector({ isVoiceGuidance, selectedLanguage }) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      setResult(data);

      if (isVoiceGuidance && data.senior_explanation) {
        speakText(`${data.senior_explanation.headline}. ${data.senior_explanation.summary}`);
      }
    } catch (err) {
      console.error("Text scan failed:", err);
    } finally {
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
            <span>{isHindi ? 'Gemini AI द्वारा जांच की जा रही है...' : 'Scanning Entities with Gemini AI...'}</span>
          ) : (
            <>
              <Search className="w-6 h-6 text-emerald-400" />
              <span>{isHindi ? 'मैसेज व UPI सुरक्षा जांचें' : 'Check Message & UPI for Scam Risk'}</span>
            </>
          )}
        </button>
      </div>

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
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-1.5 rounded-full font-black text-sm uppercase shadow-sm ${
                  isScamConfirmed ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isScamConfirmed ? '🚨 FRAUD DETECTED' : '✅ SAFE / NOT FRAUD'}
                </span>
                <span className="text-xs font-bold text-slate-600">Category: {result.scam_type}</span>
              </div>

              {isVoiceGuidance && (
                <button
                  onClick={() => speakText(`${result.senior_explanation.headline}. ${result.senior_explanation.summary}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer text-xs"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>{isHindi ? 'बोलकर सुनाएं' : 'Read Out Loud'}</span>
                </button>
              )}
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
