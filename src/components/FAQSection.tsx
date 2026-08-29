import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { t, language } = useStore();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 my-8 sm:my-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
        
        <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{language === 'te' ? 'స్పష్టమైన సమాచారం' : 'Clear & Transparent Service'}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
          {t.faqTitle}
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isOpen ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
