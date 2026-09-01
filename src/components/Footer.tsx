import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MapPin, Clock, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const { t, language, setIsSupportOpen } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-12 pb-24 md:pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center font-black text-lg shadow-md">
              K
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">K-STORES</span>
              <p className="text-[11px] text-emerald-400 font-semibold">{t.storeName}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.footerAbout}
          </p>
        </div>

        {/* Benefits Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {language === 'te' ? 'మా ప్రత్యేకతలు' : 'Why K-Stores'}
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.deliveryTime}</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.cashOnDelivery}</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'te' ? 'వాట్సాప్ ద్వారా బిల్లు రసీదు' : 'Direct WhatsApp Bill'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.pickupIn5Mins}</span>
            </li>
          </ul>
        </div>

        {/* Store Contact Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.contactStore}
          </h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="font-bold text-white text-sm">
              {t.storeName}
            </div>
            <a 
              href={`tel:${STORE_OWNER_DISPLAY_PHONE.replace(/\s+/g, '')}`} 
              className="flex items-center gap-2 font-mono font-bold text-amber-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{STORE_OWNER_DISPLAY_PHONE}</span>
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t.storeAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.storeHours}</span>
            </div>
          </div>
        </div>

        {/* Quick Help Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {language === 'te' ? 'సహాయం & మద్దతు' : 'Help & Support'}
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'te' ? 'మీ ఆర్డర్ గురించి లేదా సరుకుల వివరాల కోసం మా స్టోర్ ఓనర్‌ను సంప్రదించండి.' : 'Have a question about your order or need custom items? Contact our store owner directly.'}
          </p>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.contactStore}</span>
          </button>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} K-STORES • {t.storeName}. {language === 'te' ? 'అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.' : 'All rights reserved.'}
      </div>
    </footer>
  );
};
