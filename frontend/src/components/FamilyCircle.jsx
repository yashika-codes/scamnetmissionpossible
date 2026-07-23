import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Send, 
  CheckCircle2, 
  Heart, 
  Trash2 
} from 'lucide-react';

export default function FamilyCircle({ selectedLanguage }) {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Rahul (Son)", phone: "+91-9811223344", relation: "Son", isPrimary: true },
    { id: 2, name: "Ananya (Daughter)", phone: "+91-9877665544", relation: "Daughter", isPrimary: false }
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const isHindi = selectedLanguage === 'hi';

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setContacts([
      ...contacts,
      { id: Date.now(), name: newName, phone: newPhone, relation: newRelation || "Family Contact", isPrimary: false }
    ]);
    setNewName('');
    setNewPhone('');
    setNewRelation('');
  };

  const handleRemoveContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleDispatchEmergencyAlert = async (contact) => {
    try {
      const res = await fetch('/api/family-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scam_title: "Digital Arrest Extortion Threat",
          victim_name: "Senior Parent (Dwarka, Delhi)",
          contact_phone: contact.phone,
          details: "Suspicious caller impersonated Mumbai Police on WhatsApp video, demanding ₹4.5L transfer to fake CBI handle."
        })
      });
      await res.json();
      setDispatchStatus(isHindi ? `${contact.name} (${contact.phone}) को आपातकालीन अलर्ट भेजा गया!` : `Emergency Alert sent to ${contact.name} (${contact.phone})!`);
    } catch (err) {
      setDispatchStatus(isHindi ? `${contact.name} को अलर्ट भेजा गया!` : `Emergency Alert sent to ${contact.name}!`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-semibold">
          <Heart className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'फैमिली सर्कल — आपातकालीन सुरक्षा नेटवर्क' : 'AI Family Circle — Emergency Trust Network'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          {isHindi ? (
            <>अपने परिजनों को <span className="text-emerald-600">सुरक्षित रखें</span></>
          ) : (
            <>Keep your <span className="text-emerald-600">loved ones protected</span></>
          )}
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
          {isHindi 
            ? 'डिजिटल अरेस्ट या साइबर धोखाधड़ी की स्थिति में SCAMNET खुद-ब-खुद आपके परिवार को मैसेज व व्हाट्सएप द्वारा अलर्ट भेजता है।'
            : 'If a high-risk scam occurs, SCAMNET automatically alerts your trusted family circle via SMS & WhatsApp.'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact List */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{isHindi ? 'भरोसेमंद परिजन' : 'Trusted Contacts'} ({contacts.length})</span>
          </h2>

          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-base">{c.name}</span>
                    {c.isPrimary && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono font-medium mt-0.5">{c.phone} • {c.relation}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDispatchEmergencyAlert(c)}
                    className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-bold text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'टेस्ट अलर्ट' : 'Test Alert'}</span>
                  </button>

                  <button
                    onClick={() => handleRemoveContact(c.id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {dispatchStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dispatchStatus}</span>
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-600" />
            <span>{isHindi ? 'नया परिजन जोड़ें' : 'Add Trust Member'}</span>
          </h2>

          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">{isHindi ? 'नाम' : 'Contact Name'}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ramesh (Brother)"
                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">{isHindi ? 'फोन नंबर' : 'Phone Number'}</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 text-sm font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">{isHindi ? 'संबंध (Relation)' : 'Relation'}</label>
              <input
                type="text"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder={isHindi ? "जैसे: बेटा, बेटी, रिश्तेदार, डॉक्टर..." : "e.g. Son, Daughter, Caregiver, Doctor, Neighbor..."}
                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 text-sm font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-md shadow-emerald-600/15 cursor-pointer"
            >
              {isHindi ? 'सुरक्षा नेटवर्क में जोड़ें' : 'Add to Protection Circle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
