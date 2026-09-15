import React from 'react';
import { Clock, ShieldCheck, Truck, Phone, ArrowDown } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('products-section') || document.querySelector('main');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      {/* Main Friendly Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 text-white shadow-lg p-6 sm:p-10">
        {/* Soft background accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-900/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl">
          {/* Village Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Bommalatapalli Village Express Delivery</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            RA General Store
          </h1>

          <p className="mt-2 text-base sm:text-xl text-emerald-100 font-medium">
            Daily Fresh Groceries, Vegetables & Essentials Delivered in 20 Minutes
          </p>

          <p className="mt-1 text-xs sm:text-sm text-emerald-200/90">
            📍 on main road , Bommalatapalli beside chennampalli road • Everyday: 5:00 AM to 8:30 PM
          </p>

          {/* Feature Badges */}
          <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>20-Min Doorstep</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Quality Assured</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Cash on Delivery & UPI</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToProducts}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Groceries</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order%20groceries"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold rounded-xl text-sm transition-colors backdrop-blur-sm"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp: 62817 30144</span>
            </a>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div className="mt-3 bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm py-2 px-4 rounded-xl text-center shadow-sm">
        ✨ Special Offer: Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
      </div>
    </div>
  );
};
