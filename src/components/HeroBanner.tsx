import React from 'react';
import { Clock, ShieldCheck, Truck, Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white py-10 sm:py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs sm:text-sm font-semibold mb-3">
            ✨ Bommalatapalli Village Express
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            RA General Store
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 font-medium mb-1">
            Fresh Farm Groceries Delivered in 20 Minutes
          </p>
          <p className="text-xs sm:text-sm text-emerald-200">
            on main road , Bommalatapalli beside chennampalli road
          </p>
          <p className="text-xs text-emerald-200/90 mt-1">
            Open Everyday: 5:00 AM to 8:30 PM
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>20-Min Fast Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Quality Assured</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Cash on Delivery & UPI</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <button
              onClick={scrollToProducts}
              className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
            >
              Shop Groceries Now
            </button>
            <a
              href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order%20groceries"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp: 62817 30144</span>
            </a>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div className="bg-amber-300 text-slate-900 py-2 px-4 text-center text-xs sm:text-sm font-bold shadow-sm">
        Special Offer: Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
      </div>
    </div>
  );
};
