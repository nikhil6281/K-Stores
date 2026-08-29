import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  HelpCircle, 
  ShieldCheck
} from 'lucide-react';
import { 
  STORE_OWNER_DISPLAY_PHONE, 
  STORE_OWNER_PHONE, 
  getWhatsAppSupportUrl 
} from '../utils/whatsapp';

export const CustomerSupportModal: React.FC = () => {
  const {
    isSupportOpen,
    setIsSupportOpen,
    language,
    t
  } = useStore();

  if (!isSupportOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              🏪
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {t.supportTitle}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {STORE_OWNER_DISPLAY_PHONE}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSupportOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Store Profile Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                🌾
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {t.storeOwnerName}
                </h3>
                <div className="text-xs text-emerald-800 font-medium">
                  {language === 'te' ? 'మన గ్రామ విశ్వసనీయ కిరాణా షాప్' : 'Your Trusted Village Grocery Store'}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-emerald-200/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>{t.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-semibold text-emerald-950">{t.storeHours}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:+${STORE_OWNER_PHONE}`}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>{language === 'te' ? 'ఓనర్‌కి కాల్ చేయండి' : 'Call Store Owner'}</span>
            </a>

            <a
              href={getWhatsAppSupportUrl(language)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-300 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700 fill-emerald-700" />
              <span>{t.directWhatsApp}</span>
            </a>
          </div>

          {/* 20-Min Delivery Service Guarantee */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{language === 'te' ? '20 నిమిషాల డెలివరీ వాగ్దానం' : '20-Minute Delivery Promise'}</span>
            </div>
            <p className="text-amber-900/90 leading-relaxed text-[11px]">
              {language === 'te'
                ? 'మేము మన గ్రామ పరిధిలోని అన్ని వీధులు, కాలనీలకు 20 నిమిషాల్లో తాజా సరుకులు డెలివరీ చేస్తాము. ఏదైనా వస్తువు నచ్చకపోతే తలుపు ముందే తిరిగి ఇవ్వవచ్చు.'
                : 'We guarantee 20-minute delivery across all village streets. If you are not satisfied with fresh items, you can return them at doorstep without any questions asked.'}
            </p>
          </div>

          {/* FAQs Preview */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>{t.faqTitle}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">{t.faq1Q}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{t.faq1A}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">{t.faq2Q}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{t.faq2A}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">{t.faq3Q}</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">{t.faq3A}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
