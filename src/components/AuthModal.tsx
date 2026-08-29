import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, MapPin, LogOut, Sparkles, Lock, Mail, Phone, User } from 'lucide-react';
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
    showToast
  } = useStore();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [villageName, setVillageName] = useState('Chinna Bazar, Main Village');
  const [doorNo, setDoorNo] = useState('2-14/B');
  const [landmark, setLandmark] = useState('Near Ramalayam Temple');

  if (!isAuthOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      showToast('error', 'Required Field', 'Please enter your email or 10-digit mobile number');
      return;
    }

    const isPhone = /^\d+$/.test(cleanId.replace(/\D/g, '')) && cleanId.replace(/\D/g, '').length >= 10;
    const cleanPhone = isPhone ? cleanId.replace(/\D/g, '') : '9876543210';
    const email = !isPhone ? cleanId : undefined;

    // Check if user was saved previously in accounts store
    const accountsKey = 'kstores_registered_users_v2';
    let savedUsers: CustomerUser[] = [];
    try {
      savedUsers = JSON.parse(localStorage.getItem(accountsKey) || '[]');
    } catch {
      savedUsers = [];
    }

    const existing = savedUsers.find(u => u.phone === cleanPhone || (email && u.email?.toLowerCase() === email.toLowerCase()));

    const loggedInUser: CustomerUser = existing || {
      id: `usr-${cleanPhone}`,
      name: cleanPhone === '9876543210' ? 'Ramesh Kumar (రమేష్)' : `Customer (${cleanId.slice(0, 8)})`,
      phone: cleanPhone,
      email,
      savedAddress: {
        fullName: cleanPhone === '9876543210' ? 'Ramesh Kumar' : 'Customer',
        phone: cleanPhone,
        villageName,
        doorNo,
        landmark,
        pincode: '500001'
      },
      joinedAt: new Date().toISOString()
    };

    setUser(loggedInUser);
    setIsAuthOpen(false);
    showToast(
      'success',
      language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Welcome back!',
      `Logged in as ${loggedInUser.name}`
    );
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = identifier.replace(/\D/g, '');
    if (!name.trim()) {
      showToast('error', 'Name Required', 'Please enter your full name');
      return;
    }
    if (cleanPhone.length < 10 && !identifier.includes('@')) {
      showToast('error', 'Invalid Contact', 'Please enter a valid mobile number or email');
      return;
    }

    const phoneVal = cleanPhone.length >= 10 ? cleanPhone : '9876543210';
    const emailVal = identifier.includes('@') ? identifier.trim() : undefined;

    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: phoneVal,
      email: emailVal,
      savedAddress: {
        fullName: name.trim(),
        phone: phoneVal,
        villageName,
        doorNo,
        landmark,
        pincode: '500001'
      },
      joinedAt: new Date().toISOString()
    };

    // Save to local registry
    const accountsKey = 'kstores_registered_users_v2';
    try {
      const savedUsers: CustomerUser[] = JSON.parse(localStorage.getItem(accountsKey) || '[]');
      const filtered = savedUsers.filter(u => u.phone !== newUser.phone);
      localStorage.setItem(accountsKey, JSON.stringify([newUser, ...filtered]));
    } catch {
      // Ignore
    }

    setUser(newUser);
    setIsAuthOpen(false);
    showToast('success', language === 'te' ? 'ఖాతా సృష్టించబడింది' : 'Account Created!', `Welcome to K-Stores, ${newUser.name}`);
  };

  const handleQuickDemoLogin = () => {
    const demoUser: CustomerUser = {
      id: 'demo-user-ramesh',
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
    showToast('success', 'Logged in as Demo User', 'Welcome back, Ramesh Kumar! Your village cart is restored.');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthOpen(false);
    showToast('info', 'Logged Out', 'You have been safely logged out.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#0f172a] text-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-800">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center relative space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mx-auto shadow-inner">
            🛒
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-[10px] font-bold text-emerald-300">
            <span>K-Stores Village Quick-Commerce</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {user ? 'My Account Profile' : tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {user 
              ? 'Manage your village delivery address and past orders' 
              : tab === 'signin' 
                ? 'Sign in to order fresh groceries & track 20-minute delivery.' 
                : 'Sign up to unlock 20-min village delivery with Cash on Delivery.'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 pt-2 space-y-4">
          
          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">{user.name}</h3>
                    <p className="text-xs text-slate-400">+91 {user.phone}</p>
                    {user.email && <p className="text-[11px] text-slate-500">{user.email}</p>}
                  </div>
                </div>
              </div>

              {/* Saved Address */}
              {user.savedAddress && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/80 text-xs space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Saved Delivery Address</span>
                  </div>
                  <div className="text-slate-400 pl-5 text-[11px] space-y-0.5">
                    <div>{user.savedAddress.doorNo ? `${user.savedAddress.doorNo}, ` : ''}{user.savedAddress.villageName}</div>
                    <div className="text-emerald-400 font-semibold">📍 Landmark: {user.savedAddress.landmark}</div>
                  </div>
                </div>
              )}

              {/* Status Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-slate-400 text-[10px]">Cart Items</div>
                  <div className="font-black text-emerald-400 text-base">{cart.length}</div>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-slate-400 text-[10px]">Total Orders</div>
                  <div className="font-black text-purple-400 text-base">{orders.length}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-red-800/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Account</span>
              </button>
            </div>
          ) : (
            /* Auth Forms */
            <div className="space-y-4">
              
              {/* Segmented Tab Toggle (Exact match to Image 3) */}
              <div className="bg-slate-800/90 p-1 rounded-2xl flex border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    tab === 'signin'
                      ? 'bg-slate-900 text-white shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-slate-900 text-white shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create account
                </button>
              </div>

              {tab === 'signin' ? (
                /* Sign in Form */
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@example.com or 9876543210"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Password (or PIN)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg text-xs sm:text-sm transition-all cursor-pointer mt-1"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                /* Sign up Form */
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Village / Street *
                      </label>
                      <input
                        type="text"
                        required
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        placeholder="Chinna Bazar"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Door / House No
                      </label>
                      <input
                        type="text"
                        value={doorNo}
                        onChange={(e) => setDoorNo(e.target.value)}
                        placeholder="2-14/B"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Landmark (for 20-min delivery rider) *
                    </label>
                    <input
                      type="text"
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near Ramalayam Temple / Water Tank"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg text-xs sm:text-sm transition-all cursor-pointer mt-1"
                  >
                    Create account
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* 1-Tap Demo Customer (Ramesh) */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-emerald-500/50"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>1-Tap Demo Customer (Ramesh - 9876543210)</span>
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
