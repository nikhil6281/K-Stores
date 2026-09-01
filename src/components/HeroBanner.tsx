import React from 'react';
import { useStore } from '../context/StoreContext';
import { Zap, ShieldCheck, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC<{ onShopNow: () => void }> = ({ onShopNow }) => {
  const { language } = useStore();

  return (
    <div className="relative bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] text-white overflow-hidden py-10 sm:py-14 px-4 sm:px-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Content */}
        <div className="md:col-span-7 space-y-4 sm:space-y-5 text-center md:text-left">
          
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'te' ? 'గ్రామాలకు 20 నిమిషాల ఎక్స్‌ప్రెస్ డెలివరీ' : '20-Minute Express Village Delivery'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {language === 'te' ? (
              <>మీ ఇంటి వద్దకే <span className="text-amber-300">తాజా నిత్యావసరాలు</span> మరియు కూరగాయలు</>
            ) : (
              <>Fresh Daily Groceries & Vegetables <span className="text-amber-300">Delivered Fast.</span></>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto md:mx-0 leading-relaxed font-normal">
            {language === 'te' 
              ? 'ఉదయం కోసిన తాజా కూరగాయలు, పాలు, బియ్యం మరియు నిత్యావసర సరుకులు మీ ఇంటి ముందుకు. క్యాష్ ఆన్ డెలివరీ లేదా ఆన్‌లైన్ చెల్లింపు.'
              : 'Farm-fresh vegetables, dairy, rice, and daily household staples delivered in 20 minutes with Cash on Delivery and verified online payment.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onShopNow}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>{language === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Order Groceries Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 text-emerald-200 text-xs font-semibold px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{language === 'te' ? '100% నమ్మకమైన సేవ' : '100% Guaranteed'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Feature Card */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 text-white shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{language === 'te' ? 'ఈ రోజు స్పెషల్ ఆఫర్లు' : "Today's Fresh Highlights"}</span>
              </div>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                BEST PRICE
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl">
                <span>🍅 Farm Fresh Tomatoes (1 kg)</span>
                <span className="font-black text-amber-300">₹30</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl">
                <span>🥛 Heritage / Sangam Milk (500ml)</span>
                <span className="font-black text-amber-300">₹32</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl">
                <span>🍚 Sona Masoori Rice (5 kg)</span>
                <span className="font-black text-amber-300">₹320</span>
              </div>
            </div>

            <div className="pt-1 text-center text-[11px] text-emerald-200">
              ⚡ {language === 'te' ? '20 నిమిషాల్లో మీ ఇంటికి వస్తుంది' : 'Delivered right to your doorstep'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
