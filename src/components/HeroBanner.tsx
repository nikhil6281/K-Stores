import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Zap, 
  ShoppingBag
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE } from '../utils/whatsapp';

export const HeroBanner: React.FC = () => {
  const { language, setSelectedCategory } = useStore();

  const handleShopNow = () => {
    setSelectedCategory('all');
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-[#166534] text-white overflow-hidden border-b border-[#14532d]">
      {/* Subtle radial atmosphere */}
      <div className="absolute inset-0 bg-radial-[at_top_right] from-[#b91c1c]/40 via-transparent to-black/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold SAVOR-style Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-black/30 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-white tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'te' ? '20 à°¨à°¿à°®à°¿à°·à°¾à°² à°µà°¿à°²à±‡à°œà± à°¡à±†à°²à°¿à°µà°°à±€' : '20-Minute Village Delivery'}</span>
            </div>

            {/* Impact Headline matching Image 1 */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] font-sans text-white">
                SAVOR EVERY.
                <br />
                <span className="text-white">FRESH. BITE.</span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-white/80 max-w-xl font-normal leading-relaxed">
              {language === 'te' 
                ? 'à°®à°¨ à°—à±à°°à°¾à°® à°ªà±à°°à°œà°² à°•à±‹à°¸à°‚ à°¤à°¾à°œà°¾ à°•à±‚à°°à°—à°¾à°¯à°²à±, à°¨à°¿à°¤à±à°¯à°¾à°µà°¸à°° à°¸à°°à±à°•à±à°²à± à°®à°°à°¿à°¯à± à°¨à°¾à°£à±à°¯à°®à±ˆà°¨ à°•à°¿à°°à°¾à°£à°¾ à°•à±‡à°µà°²à°‚ 20 à°¨à°¿à°®à°¿à°·à°¾à°²à±à°²à±‹ à°®à±€ à°‡à°‚à°Ÿà°¿ à°®à±à°‚à°¦à±à°•à±.'
                : 'Pure local village groceries, fresh farm produce, staples, and daily essentials delivered directly to your doorstep within 20 minutes.'}
            </p>

            {/* CTA Link matching Image 1 "Shop sauces â†’" */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleShopNow}
                className="group inline-flex items-center gap-2 text-white hover:text-amber-300 font-extrabold text-base sm:text-lg uppercase tracking-wider underline underline-offset-8 transition-colors cursor-pointer"
              >
                <span>{language === 'te' ? 'à°¸à°°à±à°•à±à°²à± à°•à±Šà°¨à°‚à°¡à°¿ â†’' : 'Shop groceries â†’'}</span>
              </button>

              <button
                onClick={handleShopNow}
                className="bg-white text-[#166534] hover:bg-amber-100 font-black px-6 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#166534]" />
                <span>{language === 'te' ? 'à°†à°°à±à°¡à°°à± à°šà±‡à°¯à°‚à°¡à°¿' : 'Order Now'}</span>
              </button>
            </div>

            {/* 3 Quick USPs */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-lg text-xs">
              <div className="space-y-0.5">
                <div className="font-extrabold text-white">âš¡ 20 MINS</div>
                <div className="text-[10px] text-white/70">Doorstep Delivery</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-white">ðŸ’µ CASH / UPI</div>
                <div className="text-[10px] text-white/70">Pay on Delivery</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-white">ðŸ“± WHATSAPP</div>
                <div className="text-[10px] text-white/70">{STORE_OWNER_DISPLAY_PHONE}</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Product Showcase */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Product Bottle Showcase Card */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-amber-400 text-black font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Featured Deal
                  </div>
                  <span className="text-xs text-white/80 font-mono">100% Genuine</span>
                </div>

                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center p-4">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
                    alt="Fresh Farm Produce"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Farm Fresh Vegetables
                  </div>
                </div>

                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">Fresh Farm Tomatoes</h3>
                    <p className="text-xs text-white/70">1 kg â€¢ Locally grown</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-300">â‚¹28</span>
                    <span className="text-xs text-white/50 line-through ml-1">â‚¹35</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

