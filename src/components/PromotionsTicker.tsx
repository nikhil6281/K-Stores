import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Gift, Zap } from 'lucide-react';

export const PromotionsTicker: React.FC = () => {
  const { t, language } = useStore();

  return (
    <div className="bg-amber-500 text-emerald-950 text-xs font-semibold py-1.5 px-4 overflow-hidden border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-white/80 text-emerald-950 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {language === 'te' ? 'ఆఫర్' : 'OFFER'}
          </span>
        </div>

        <div className="flex-1 truncate text-center sm:text-left text-[12px] font-medium text-emerald-950">
          <span>{t.tickerNotice}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-bold text-emerald-950 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-900" />
            {language === 'te' ? '20 నిమిషాల గ్యారెంటీ' : '20-Min Guarantee'}
          </span>
          <span className="flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-emerald-900" />
            {language === 'te' ? 'క్యాష్ ఆన్ డెలివరీ' : 'Cash on Delivery'}
          </span>
        </div>
      </div>
    </div>
  );
};
