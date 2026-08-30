import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ArrowRight, Package, User, LogOut, MapPin } from 'lucide-react';
import type { CustomerUser } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    user,
    setUser,
    language,
    orders,
    cart,
    setIsHistoryOpen,
    showToast
  } = useStore();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthOpen) return null;

  // Google 1-Click Sign-In
  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const googleUser: CustomerUser = {
        id: `usr-google-${Date.now()}`,
        name: 'K-Stores Customer',
        email: 'customer@gmail.com',
        phone: '9876543210',
        savedAddress: {
          fullName: 'K-Stores Customer',
          phone: '9876543210',
          villageName: 'Chinna Bazar, Main Village',
          doorNo: '3-12/A',
          landmark: 'Near Ramalayam Temple',
          pincode: '500001',
        },
        joinedAt: new Date().toISOString(),
      };

      setUser(googleUser);
      setIsSubmitting(false);
      setIsAuthOpen(false);
      showToast(
        'success',
        language === 'te' ? 'గూగుల్ లాగిన్ విజయవంతమైంది' : 'Google Sign-In Successful',
        `Welcome to K-Stores, ${googleUser.name}!`
      );
    }, 600);
  };

  // Email / Phone Sign-In
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailOrPhone.trim();
    if (!clean) {
      showToast('error', 'Required Field', 'Please enter your email or mobile number');
      return;
    }

    if (!showPassword && clean.includes('@')) {
      setShowPassword(true);
      return;
    }

    const isPhone = /^\d+$/.test(clean.replace(/\D/g, '')) && clean.replace(/\D/g, '').length >= 10;
    const phone = isPhone ? clean.replace(/\D/g, '') : '9876543210';
    const email = !isPhone ? clean : undefined;
    const userName = name.trim() || (email ? email.split('@')[0] : `Customer (${phone.slice(-4)})`);

    const newUser: CustomerUser = {
      id: `usr-${phone || Date.now()}`,
      name: userName,
      phone,
      email,
      savedAddress: {
        fullName: userName,
        phone,
        villageName: 'Chinna Bazar, Main Village',
        doorNo: '2-14/B',
        landmark: 'Near Grama Center',
        pincode: '500001',
      },
      joinedAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsAuthOpen(false);
    showToast(
      'success',
      language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Sign in Successful',
      `Welcome, ${newUser.name}!`
    );
  };

  const handleLogout = () => {
    setUser(null);
    showToast('info', 'Logged Out', 'You have been signed out.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white text-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header matching Image 4 */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {user ? 'My Account' : 'Sign in or create account'}
          </h2>

          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#9e1a22] text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{user.name}</h3>
                  {user.phone && <p className="text-xs text-slate-500">+91 {user.phone}</p>}
                  {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                </div>
              </div>

              {user.savedAddress && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#9e1a22]" />
                    <span>Saved Delivery Address</span>
                  </div>
                  <div className="text-slate-600 pl-5 text-[11px] space-y-0.5">
                    <div>{user.savedAddress.doorNo ? `${user.savedAddress.doorNo}, ` : ''}{user.savedAddress.villageName}</div>
                    <div className="text-[#9e1a22] font-semibold">📍 Landmark: {user.savedAddress.landmark}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setIsAuthOpen(false);
                    setIsHistoryOpen(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800 transition-colors"
                >
                  <div className="text-slate-500 text-[10px]">Total Orders</div>
                  <div className="font-black text-base text-[#9e1a22]">{orders.length}</div>
                </button>
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800">
                  <div className="text-slate-500 text-[10px]">Cart Items</div>
                  <div className="font-black text-base text-emerald-700">{cart.length}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-[#9e1a22] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Sign in form matching Image 4 */
            <div className="space-y-4">
              
              {/* Google Sign-in Single Sign-on Button matching Image 4 */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-3 flex items-center justify-between shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {/* Google G Logo SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Continue with Google
                  </span>
                </div>

                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  1-click
                </span>
              </button>

              {/* OR Divider matching Image 4 */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Email / Mobile input form with Arrow button */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Email or mobile number"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9e1a22] focus:ring-2 focus:ring-[#9e1a22]/20 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#9e1a22] hover:bg-[#83181d] text-white transition-colors cursor-pointer"
                    aria-label="Submit"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {showPassword && (
                  <div className="space-y-2 animate-scale-up">
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password or leave blank for OTP"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9e1a22] focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9e1a22] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Checkbox matching Image 4 */}
                <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9e1a22] focus:ring-[#9e1a22] border-slate-300 cursor-pointer"
                  />
                  <span>Email me with news and offers</span>
                </label>
              </form>

              {/* Bottom Navigation Buttons matching Image 4 [ Orders ] [ Profile ] */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthOpen(false);
                    setIsHistoryOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-slate-600" />
                  <span>Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill demo
                    setEmailOrPhone('ramesh@village.com');
                    setName('Ramesh Kumar');
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Demo Profile</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
