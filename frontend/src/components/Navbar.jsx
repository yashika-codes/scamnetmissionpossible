import React from 'react';
import { 
  ShieldAlert, 
  Eye, 
  Volume2, 
  VolumeX, 
  Sun, 
  Activity, 
  Sparkles,
  Globe
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  isHighContrast, 
  setIsHighContrast,
  isVoiceGuidance, 
  setIsVoiceGuidance,
  selectedLanguage,
  setSelectedLanguage
}) {

  // Toggle High Contrast Across Entire App
  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    document.documentElement.classList.toggle('high-contrast', newState);
    document.body.classList.toggle('high-contrast', newState);
  };

  // Toggle Voice Guidance
  const toggleVoiceGuidance = () => {
    const newState = !isVoiceGuidance;
    setIsVoiceGuidance(newState);
    if (!newState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const isHindi = selectedLanguage === 'hi';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-sm">
      {/* Top Senior Accessibility Bar */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>
              {isHindi ? 'वरिष्ठ नागरिक सुरक्षा एवं साइबर सेल रक्षा पोर्टल' : 'Senior Protection & Cyber Cell Defense Portal'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-bold focus:outline-none cursor-pointer"
                title="Select Language"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all font-medium border cursor-pointer ${
                isHighContrast 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle High Contrast"
            >
              <Sun className="w-4 h-4" />
              <span>
                {isHighContrast 
                  ? (isHindi ? 'हाई कंट्रास्ट: चालू' : 'High Contrast: ON') 
                  : (isHindi ? 'हाई कंट्रास्ट' : 'High Contrast')}
              </span>
            </button>

            {/* Voice Guidance Toggle */}
            <button
              onClick={toggleVoiceGuidance}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all font-medium border cursor-pointer ${
                isVoiceGuidance 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' 
                  : 'bg-red-950 text-red-200 border-red-800 hover:bg-red-900'
              }`}
              title="Voice Guidance Reader"
            >
              {isVoiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>
                {isVoiceGuidance 
                  ? (isHindi ? 'वॉइस गाइडेंस: चालू' : 'Voice Guidance: ON') 
                  : (isHindi ? 'वॉइस गाइडेंस: बंद' : 'Voice Guidance: OFF')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Dual View Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('guardian')}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-wider text-slate-900">SCAM<span className="text-emerald-600">NET</span></span>
              <span className="bg-emerald-500/10 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                I4C / RBI AI Layer
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isHindi ? 'भारत की फ्रॉड-डिफेंस और वरिष्ठ नागरिक सुरक्षा कवच' : "India's Missing Fraud-Defense & Elder Shield"}
            </p>
          </div>
        </div>

        {/* Dual View Tabs Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner">
          <button
            onClick={() => setCurrentView('guardian')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              currentView === 'guardian'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'गार्डियन व्यू (नागरिक)' : 'Guardian View (Elders)'}</span>
          </button>

          <button
            onClick={() => setCurrentView('intelligence')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              currentView === 'intelligence'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-4 h-4 text-white" />
            <span>{isHindi ? 'इंटेलिजेंस लेयर (साइबर सेल)' : 'Intelligence Layer (Cyber-Cell)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
