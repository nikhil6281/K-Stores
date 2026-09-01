import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ArrowRight, Package, Loader2, Mail, Lock } from 'lucide-react';
import type { CustomerUser } from '../types';
import { signInWithGoogleReal, signOutReal } from '../services/firebaseSync';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isAuthOpen) return null;

  // Real Google Sign-In (Working)
  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      const gUser = await signInWithGoogleReal();
      
      const loggedUser: CustomerUser = {
        id: gUser.id,
        name: gUser.name,
        email: gUser.email,
        phone: gUser.phone || '',
        savedAddress: (gUser as any).savedAddress,
        joinedAt: new Date().toISOString(),
      };

      setUser(loggedUser);
      setIsAuthOpen(false);
      showToast(
        'success',
        language === 'te' ? 'గూగుల్ లాగిన్ విజయవంతమైంది!' : 'Google Sign-In Successful!',
        `Welcome, ${loggedUser.name}`
      );
    } catch (err: any) {
      showToast('error', 'Login Cancelled', 'Google Sign-In was cancelled or closed.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Email & Password Sign-In
  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!password.trim() || password.length < 4) {
      showToast('error', 'Password Required', 'Please enter your password (at least 4 characters)');
      return;
    }

    const userName = cleanEmail.split('@')[0];
    const loggedUser: CustomerUser = {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: cleanEmail,
      phone: '',
      joinedAt: new Date().toISOString(),
    };

    setUser(loggedUser);
    setIsAuthOpen(false);
    showToast(
      'success',
      language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Sign in Successful',
      `Welcome, ${loggedUser.name}!`
    );
  };

  const handleLogout = async () => {
    await signOutReal();
    setUser(null);
    showToast('info', 'Logged Out', 'You have been signed out.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white text-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {user ? 'My Account' : 'Sign in or create account'}
          </h2>

          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
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
                  {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setIsAuthOpen(false);
                    setIsHistoryOpen(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800 transition-colors cursor-pointer"
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
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Sign in form */
            <div className="space-y-4">
              
              {/* Primary: Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-3 flex items-center justify-between shadow-xs transition-all cursor-pointer group disabled:opacity-70"
              >
                <div className="flex items-center gap-3">
                  {isLoadingGoogle ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                  )}
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {isLoadingGoogle ? 'Connecting to Google...' : 'Continue with Google'}
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  1-Click
                </span>
              </button>

              {/* OR Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Email & Password Inputs */}
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9e1a22] focus:ring-2 focus:ring-[#9e1a22]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#9e1a22] focus:ring-2 focus:ring-[#9e1a22]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9e1a22] focus:ring-[#9e1a22] border-slate-300 cursor-pointer"
                  />
                  <span>Email me with 20-min grocery offers</span>
                </label>

                <button
                  type="submit"
                  className="w-full bg-[#9e1a22] hover:bg-[#83181d] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
                >
                  <span>Sign in with Email & Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Action: View Orders */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthOpen(false);
                    setIsHistoryOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>View Past Orders</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

