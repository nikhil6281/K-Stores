import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Lock, KeyRound } from 'lucide-react';
import { sounds } from '../../utils/sound';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginOpen,
    setIsAdminLoginOpen,
    setIsOwnerMode,
    language,
    t,
    showToast
  } = useStore();

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isAdminLoginOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '9874') {
      setIsOwnerMode(true);
      setIsAdminLoginOpen(false);
      setPasscode('');
      setError('');
      sounds.playAdminChime();
      showToast('success', language === 'te' ? 'ఓనర్ మోడ్ ఆన్ చేయబడింది' : 'Owner Mode Active', language === 'te' ? 'లైవ్ ఆర్డర్లు మరియు స్టాక్ మేనేజర్ సిద్ధంగా ఉంది' : 'Store Owner Dashboard unlocked.');
    } else {
      setError(t.invalidPasscode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-purple-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-6 text-center relative">
          <button
            onClick={() => setIsAdminLoginOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-white">
            {t.adminLoginTitle}
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-xs mx-auto">
            {t.adminLoginDesc}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-purple-700" />
              <span>{t.adminPasscode}</span>
            </label>
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder={language === 'te' ? 'స్టోర్ పాస్‌కీ నమోదు చేయండి' : 'Enter store passkey'}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center font-mono text-lg tracking-widest focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            {error && (
              <p className="text-xs text-red-600 font-bold mt-1.5 text-center">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg text-xs sm:text-sm transition-all cursor-pointer"
          >
            {t.adminLoginBtn}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            {language === 'te' ? 'గ్రామ స్టోర్ ఓనర్ & సిబ్బంది మాత్రమే.' : 'For village store owner & staff only.'}
          </p>
        </form>

      </div>
    </div>
  );
};
