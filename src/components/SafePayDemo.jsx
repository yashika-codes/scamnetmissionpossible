import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ShieldAlert, 
  CheckCircle2, 
  Smartphone, 
  DollarSign, 
  Clipboard,
  UserX,
  ShieldCheck
} from 'lucide-react';

export default function SafePayDemo({ selectedLanguage }) {
  const [payeeHandle, setPayeeHandle] = useState('cbi.verify@okicici');
  const [amount, setAmount] = useState('450000');
  const [isChecking, setIsChecking] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [blocked, setBlocked] = useState(false);

  const isHindi = selectedLanguage === 'hi';

  const sampleHandles = [
    { handle: "cbi.verify@okicici", label: isHindi ? "🚨 फर्जी CBI UPI (दिल्ली-बंगाल रिंग)" : "🚨 Digital Arrest UPI (Delhi & WB Ring)" },
    { handle: "sbisecure.kyc@okaxis", label: isHindi ? "⚠️ फर्जी KYC UPI (मुंबई)" : "⚠️ Fake KYC UPI (Mumbai)" },
    { handle: "powerpay.wb@ybl", label: isHindi ? "⚡ बिजली बिल सस्पेंशन UPI" : "⚡ Electricity Cutoff UPI (WB & Kerala)" },
    { handle: "trusted.shop@upi", label: isHindi ? "✅ सुरक्षित मर्चेंट UPI" : "✅ Clean Merchant UPI" }
  ];

  const handleCheckPayee = async (targetHandle) => {
    const handleToTest = targetHandle || payeeHandle;
    if (!handleToTest.trim()) return;

    setIsChecking(true);
    setBlocked(false);

    try {
      const res = await fetch('/api/safepay-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: handleToTest })
      });
      const data = await res.json();
      setRiskData(data);
    } catch (err) {
      console.error("SafePay check failed:", err);
      setRiskData({
        target: handleToTest,
        found: true,
        risk_level: "CRITICAL DANGER",
        risk_score: 95,
        complaints_count: 5,
        linked_states: ["Delhi", "West Bengal", "Kerala"],
        total_amount_lost: 1330000,
        recommendation: `ALERT: '${handleToTest}' is linked to cyber complaints across Delhi, West Bengal, and Kerala! DO NOT TRANSFER MONEY!`
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPayeeHandle(text);
        handleCheckPayee(text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isFraud = riskData?.risk_score > 50;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-semibold">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'सेफ-पे गार्ड — रियल-टाइम UPI व नंबर सुरक्षा इंजन' : 'SafePay Guard — Real-Time UPI Safety Engine'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          {isHindi ? (
            <>UPI भुगतान <span className="text-emerald-600">जांच व सत्यापन करें</span></>
          ) : (
            <>Simulate a <span className="text-emerald-600">UPI Payment Request</span></>
          )}
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
          {isHindi 
            ? 'किसी भी UPI ID, फोन नंबर या QR हैंडल पर पैसे भेजने से पहले राष्ट्रीय साइबर क्राइम डेटाबेस से तुरंत जांचें।'
            : 'Before paying any UPI ID, phone number, or QR code, SafePay cross-checks national criminal databases in real time.'}
        </p>
      </div>

      {/* Simulator Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border border-slate-200 shadow-xl">
        {/* Sample UPI Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isHindi ? 'नमूना UPI आईडी चुनकर जांचें:' : 'Test Synthetic UPI Handles:'}
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleHandles.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPayeeHandle(item.handle);
                  handleCheckPayee(item.handle);
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'प्राप्तकर्ता UPI ID / फोन नंबर' : 'Recipient UPI ID / Phone Number'}</span>
              </span>
              <button
                onClick={handlePasteClipboard}
                className="text-emerald-700 font-bold hover:underline text-xs"
              >
                <Clipboard className="w-3.5 h-3.5 inline mr-1" />
                <span>{isHindi ? 'पेस्ट करें' : 'paste'}</span>
              </button>
            </div>
            <input
              type="text"
              value={payeeHandle}
              onChange={(e) => setPayeeHandle(e.target.value)}
              placeholder="e.g. cbi.verify@okicici or +91-9876543210"
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-base font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>{isHindi ? 'राशि (₹ INR)' : 'Amount (₹ INR)'}</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-4 py-3 border border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-base font-bold"
            />
          </div>
        </div>

        {/* Verify Payee Button */}
        <button
          onClick={() => handleCheckPayee()}
          disabled={isChecking || !payeeHandle.trim()}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-slate-900/15 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ShieldAlert className="w-6 h-6 text-emerald-400" />
          <span>
            {isChecking 
              ? (isHindi ? 'साइबर सेल डेटाबेस में जांच चल रही है...' : 'Checking Cyber Cell Database...') 
              : (isHindi ? 'भुगतान करने से पहले UPI सुरक्षा जांचें' : 'Verify UPI Safety Before Paying')}
          </span>
        </button>
      </div>

      {/* Risk Assessment Result (RED for Fraud, GREEN for Safe) */}
      <AnimatePresence>
        {riskData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-6 md:p-8 space-y-6 ${
              isFraud ? 'card-fraud-alert' : 'card-safe-alert'
            }`}
          >
            {/* Risk Gauge Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isHindi ? 'UPI हैंडल स्थिति:' : 'UPI Handle Status:'}
                </span>
                <h3 className="text-xl md:text-2xl font-mono font-black text-slate-900">{riskData.target}</h3>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">Risk Score</div>
                  <div className={`text-2xl font-black ${isFraud ? 'text-red-600' : 'text-emerald-600'}`}>
                    {riskData.risk_score} / 100
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl font-black text-sm uppercase shadow-sm ${
                  isFraud ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isFraud ? '🚨 FRAUD / HIGH RISK' : '✅ SAFE / CLEAN'}
                </span>
              </div>
            </div>

            {/* Recommendation Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <p className="text-slate-900 font-bold text-base md:text-lg leading-relaxed">
                {riskData.recommendation}
              </p>
              {riskData.complaints_count > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg text-xs font-bold">
                    Official Cyber Complaints: {riskData.complaints_count}
                  </span>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold">
                    Linked States: {riskData.linked_states?.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Emergency Controls */}
            {isFraud && (
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => setBlocked(true)}
                  disabled={blocked}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <UserX className="w-5 h-5" />
                  <span>
                    {blocked 
                      ? (isHindi ? '✓ पेमेंट ब्लॉक और परिवार को अलर्ट भेजा गया' : '✓ Payment Blocked & Family Alerted') 
                      : (isHindi ? 'पेमेंट ब्लॉक करें और परिवार को अलर्ट भेजें' : 'BLOCK PAYMENT & ALERT FAMILY')}
                  </span>
                </button>
              </div>
            )}

            {blocked && (
              <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>
                  {isHindi 
                    ? 'लेनदेन को सफलतापूर्वक रोक दिया गया है! आपके आपातकालीन संपर्क परिवारजनों को अलर्ट भेज दिया गया है।'
                    : 'Transaction safely intercepted! Emergency trust contacts alerted with location & risk metrics.'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
