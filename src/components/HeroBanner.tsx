import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Zap, 
  Banknote, 
  MessageSquare, 
  Store, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE } from '../utils/whatsapp';

export const HeroBanner: React.FC = () => {
  const { t, language, setSelectedCategory, setIsSupportOpen } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white rounded-3xl mx-4 sm:mx-6 my-4 shadow-xl border border-emerald-700/50">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Text & Hero Details */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 bg-emerald-700/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'te' ? 'గ్రామ ప్రజలకు ప్రత్యేక కిరాణా సేవ' : 'First Superfast Kirana Delivery for our Village'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              {t.bannerTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
              {t.bannerSubtitle}
            </p>

            {/* Key Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white leading-tight">20 Min Delivery</div>
                <div className="text-[10px] text-emerald-200">{language === 'te' ? 'గ్రామ పరిధిలో' : 'To your doorstep'}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="w-7 h-7 rounded-lg bg-green-400/20 text-green-300 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white leading-tight">Cash on Delivery</div>
                <div className="text-[10px] text-emerald-200">{language === 'te' ? 'వచ్చాక డబ్బులు' : 'Cash / PhonePe'}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white leading-tight">WhatsApp Bill</div>
                <div className="text-[10px] text-emerald-200">{STORE_OWNER_DISPLAY_PHONE}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="w-7 h-7 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white leading-tight">Store Pickup</div>
                <div className="text-[10px] text-emerald-200">{language === 'te' ? '5 నిమిషాల్లో' : 'Ready in 5 mins'}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
              >
                <span>{t.shopNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSupportOpen(true)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-sm backdrop-blur-md flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{language === 'te' ? 'షాప్ వివరాలు & ఫోన్' : 'Store Details & Phone'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Visual Card / 20-Min Promise Highlights */}
          <div className="lg:col-span-5">
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
              
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md">
                    ⚡
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{language === 'te' ? '20 నిమిషాల డెలివరీ గ్యారెంటీ' : '20-Min Delivery Promise'}</div>
                    <div className="text-[11px] text-amber-300">{language === 'te' ? 'బ్లింకిట్ లాంటి ఫాస్ట్ సర్వీస్' : 'Village Quick Commerce'}</div>
                  </div>
                </div>

                <div className="bg-emerald-700/80 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-100 border border-emerald-500/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{language === 'te' ? 'లైవ్' : 'LIVE'}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'te' ? '1. మీ ఆర్డర్ వెంటనే ప్యాక్ అవుతుంది' : '1. Instant Store Item Packing'}
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      {language === 'te' ? 'సరుకులు మన ఊరి షాప్‌లోనే అందుబాటులో ఉన్నాయి' : 'Items picked directly from local Kirana shelves'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'te' ? '2. బైక్‌పై నేరుగా మీ ఇంటి ముందుకు' : '2. Fast Bike Delivery across Village'}
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      {language === 'te' ? 'చిన్న బజార్, రామాలయం వీధి, కాలనీలకు 20 నిమిషాల్లో' : 'Delivered within 20 mins to any landmark'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'te' ? '3. వాట్సాప్ రసీదు & నగదు చెల్లింపు' : '3. WhatsApp Bill & Cash on Delivery'}
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      {language === 'te' ? 'సరుకులు పరిశీలించాక డబ్బులు ఇవ్వండి' : 'Check products at door and pay with Cash or UPI'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner WhatsApp banner */}
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-medium">{language === 'te' ? 'ఓనర్ వాట్సాప్:' : 'Store WhatsApp:'}</span>
                <span className="bg-emerald-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-400/30">
                  {STORE_OWNER_DISPLAY_PHONE}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
