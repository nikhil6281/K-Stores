import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Globe, 
  Clock, 
  MapPin 
} from 'lucide-react';

export const Header: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const {
    cartItemsCount,
    cartTotal,
    setIsCartOpen,
    user,
    setIsAuthOpen,
    language,
    setLanguage,
    setIsAdminLoginOpen,
    isOwnerMode
  } = useStore();

  const teluguWord = '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41'; // Telugu: తెలుగు

  return (
    <header className="sticky top-0 z-40 bg-[#166534] text-white shadow-md">
      {/* Top Value Banner */}
      <div className="bg-[#14532d] text-emerald-100 text-[11px] font-medium px-4 py-1.5 flex items-center justify-between border-b border-emerald-800/60">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'te' ? '20 నిమిషాల డెలివరీ' : '20-Min Village Delivery'}</span>
            </span>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span className="hidden sm:inline text-emerald-200">
              {language === 'te' ? 'ఉచిత డెలివరీ ₹199 పైన' : 'Free delivery on orders over ₹199'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1.5 font-bold text-white hover:text-amber-300 transition-colors cursor-pointer bg-emerald-900/80 px-3 py-1 rounded-lg border border-emerald-700/80 text-xs shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? teluguWord : 'English'}</span>
            </button>

            {!isOwnerMode && (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-emerald-300 hover:text-white transition-colors cursor-pointer font-medium text-[11px]"
              >
                Owner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#166534] flex items-center justify-center font-black text-xl shadow-md">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                K-STORES
              </span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                20 MIN
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span>{language === 'te' ? 'మన కిరాణా • తాజా సరుకులు' : 'Mana Kirana • Fresh Daily'}</span>
            </p>
          </div>
        </div>

        {/* Search Trigger */}
        <div className="flex-1 max-w-lg hidden md:block">
          <button
            onClick={() => onOpenSearch && onOpenSearch()}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs transition-all cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-300" />
              <span>{language === 'te' ? 'కూరగాయలు, పాలు, నిత్యావసరాలు వెతకండి...' : 'Search vegetables, dairy, groceries...'}</span>
            </div>
            <kbd className="bg-white/20 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">Ctrl+K</kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : (language === 'te' ? 'లాగిన్' : 'Sign In')}</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'te' ? 'కార్ట్' : 'Cart'}</span>
            {cartItemsCount > 0 && (
              <span className="bg-[#166534] text-white text-[11px] font-black px-1.5 py-0.2 rounded-full">
                {cartItemsCount}
              </span>
            )}
            {cartTotal > 0 && (
              <span className="font-extrabold border-l border-slate-950/20 pl-2">
                ₹{cartTotal}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
