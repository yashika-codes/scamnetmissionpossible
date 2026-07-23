import React, { useState } from 'react';
import Navbar from './components/Navbar';
import VoiceGuardian from './components/VoiceGuardian';
import ScamDetector from './components/ScamDetector';
import SafePayDemo from './components/SafePayDemo';
import FamilyCircle from './components/FamilyCircle';
import GraphDashboard from './components/GraphDashboard';
import { 
  Mic, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  ShieldAlert
} from 'lucide-react';

export default function App() {
  // Main Dual-View state ('guardian' vs 'intelligence')
  const [currentView, setCurrentView] = useState('guardian');

  // Guardian View Sub-tabs ('voice' | 'detector' | 'safepay' | 'family')
  const [guardianTab, setGuardianTab] = useState('voice');

  // Accessibility States (Voice guidance ON by default)
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceGuidance, setIsVoiceGuidance] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const isHindi = selectedLanguage === 'hi';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Navbar */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isHighContrast={isHighContrast}
          setIsHighContrast={setIsHighContrast}
          isVoiceGuidance={isVoiceGuidance}
          setIsVoiceGuidance={setIsVoiceGuidance}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Sub-Navigation for Guardian View */}
          {currentView === 'guardian' && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <button
                onClick={() => setGuardianTab('voice')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  guardianTab === 'voice'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'वॉइस गार्डियन' : 'Voice Guardian'}</span>
              </button>

              <button
                onClick={() => setGuardianTab('detector')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  guardianTab === 'detector'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'स्कैमशील्ड मैसेज व UPI' : 'ScamShield Scanner'}</span>
              </button>

              <button
                onClick={() => setGuardianTab('safepay')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  guardianTab === 'safepay'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'सेफ-पे गार्ड' : 'SafePay Guard'}</span>
              </button>

              <button
                onClick={() => setGuardianTab('family')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  guardianTab === 'family'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'फैमिली सर्कल' : 'Family Circle'}</span>
              </button>
            </div>
          )}

          {/* View Components Rendering */}
          {currentView === 'guardian' ? (
            <>
              {guardianTab === 'voice' && <VoiceGuardian isVoiceGuidance={isVoiceGuidance} selectedLanguage={selectedLanguage} />}
              {guardianTab === 'detector' && <ScamDetector isVoiceGuidance={isVoiceGuidance} selectedLanguage={selectedLanguage} />}
              {guardianTab === 'safepay' && <SafePayDemo selectedLanguage={selectedLanguage} />}
              {guardianTab === 'family' && <FamilyCircle selectedLanguage={selectedLanguage} />}
            </>
          ) : (
            <GraphDashboard />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-2 shadow-inner">
        <div className="flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900">SCAMNET — India's Missing Fraud-Defense Layer</span>
        </div>
        <p>{isHindi ? 'वरिष्ठ नागरिक सुरक्षा और क्रॉस-स्टेट साइबर सेल इंटेलिजेंस हेतु निर्मित' : 'Built for Elder Citizen Protection & Cross-State Cyber Cell Intelligence • Powered by Gemini AI & NetworkX'}</p>
        <p className="text-[11px] text-slate-400 font-medium">National Cyber Crime Helpline: 1930</p>
      </footer>
    </div>
  );
}
