import React from 'react';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC<{ onShopNow?: () => void }> = ({ onShopNow }) => {
  const handleShop = () => {
    if (onShopNow) onShopNow();
    else {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] text-white overflow-hidden py-12 sm:py-16 px-4 sm:px-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
        
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>20-MINUTE VILLAGE EXPRESS DELIVERY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Fresh Daily Groceries <span className="text-amber-300">Delivered Fast.</span>
        </h1>

        <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed font-normal">
          Farm-fresh vegetables, dairy, rice, and daily household staples delivered right to your doorstep in 20 minutes with Cash on Delivery and verified online payment.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleShop}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Order Groceries Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-200 text-xs sm:text-sm font-semibold px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Quality Guaranteed</span>
          </div>
        </div>

      </div>
    </div>
  );
};
