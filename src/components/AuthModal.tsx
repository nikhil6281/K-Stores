import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, MapPin, LogOut, Sparkles } from 'lucide-react';
import type { CustomerUser } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    user,
    setUser,
    language,
    t,
    showToast
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [villageName, setVillageName] = useState('Chinna Bazar, Main Road');
  const [doorNo, setDoorNo] = useState('2-14/B');
  const [landmark, setLandmark] = useState('Near Ramalayam Temple');

  if (!isAuthOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim() || cleanPhone.length < 10) {
      showToast('error', 'Invalid Input', language === 'te' ? 'దయచేసి సరైన పేరు మరియు 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please provide name and valid 10-digit mobile number');
      return;
    }

    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim() || undefined,
      savedAddress: {
        fullName: name.trim(),
        phone: cleanPhone,
        villageName,
        doorNo,
        landmark,
        pincode: '500001'
      },
      joinedAt: new Date().toISOString()
    };

    setUser(newUser);
    setIsAuthOpen(false);
    showToast('success', language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Welcome!', `Hello ${newUser.name}`);
  };

  const handleQuickDemoLogin = () => {
    const demoUser: CustomerUser = {
      id: 'demo-user-1',
      name: 'Ramesh Kumar (రమేష్)',
      phone: '9876543210',
      email: 'ramesh.village@example.com',
      savedAddress: {
        fullName: 'Ramesh Kumar',
        phone: '9876543210',
        villageName: 'Chinna Bazar, Main Village',
        doorNo: '4-22/A',
        landmark: 'Opposite Ramalayam Temple & Water Tank',
        pincode: '500001'
      },
      joinedAt: new Date().toISOString()
    };

    setUser(demoUser);
    setIsAuthOpen(false);
    showToast('success', 'Logged In', 'Demo customer profile active.');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthOpen(false);
    showToast('info', 'Logged Out', 'You have been logged out.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              👤
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {user ? t.myAccount : t.customerLogin}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {language === 'te' ? 'కె-స్టోర్స్ కస్టమర్ ఖాతా' : 'K-Stores Customer Account'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{user.name}</h3>
                    <p className="text-xs text-slate-600">+91 {user.phone}</p>
                    {user.email && <p className="text-[11px] text-slate-500">{user.email}</p>}
                  </div>
                </div>
              </div>

              {/* Saved Address */}
              {user.savedAddress && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>{t.deliveryAddress}</span>
                  </div>
                  <div className="text-slate-600 pl-5 text-[11px]">
                    <div>{user.savedAddress.doorNo ? `${user.savedAddress.doorNo}, ` : ''}{user.savedAddress.villageName}</div>
                    <div className="text-emerald-800 font-semibold">📍 Landmark: {user.savedAddress.landmark}</div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Account</span>
              </button>
            </div>
          ) : (
            /* Sign up / Login form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.enterFullName}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.phoneNumber} (WhatsApp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.enterPhoneNumber}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.villageName}
                  </label>
                  <input
                    type="text"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.doorNo}
                  </label>
                  <input
                    type="text"
                    value={doorNo}
                    onChange={(e) => setDoorNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.landmark}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={t.enterLandmark}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm transition-all cursor-pointer"
              >
                {language === 'te' ? 'ఖాతా తెరవండి / లాగిన్' : 'Create Account / Login'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">or</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Quick Demo Customer Button */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>1-Tap Demo Customer (రమేష్ - విలేజ్ యూజర్)</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
