import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Search, ShoppingBag, User, MessageCircle } from 'lucide-react';

export const BottomNav: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const {
    cartItemCount,
    cartTotal,
    setIsCartOpen,
    setIsAuthOpen,
    setIsSupportOpen,
    language
  } = useStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around text-slate-600">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex flex-col items-center gap-0.5 p-1 text-[#166534] font-bold text-[10px] cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span>{language === 'te' ? 'హోమ్' : 'Home'}</span>
      </button>

      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-[#166534] text-[10px] font-semibold cursor-pointer"
      >
        <Search className="w-5 h-5" />
        <span>{language === 'te' ? 'వెతకండి' : 'Search'}</span>
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-[#166534] text-[10px] font-semibold relative cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>{language === 'te' ? 'కార్ట్' : 'Cart'}</span>
        {cartItemCount > 0 && (
          <span className="absolute top-0 right-1 bg-[#166534] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setIsSupportOpen(true)}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-emerald-700 text-[10px] font-semibold cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <span>{language === 'te' ? 'సహాయం' : 'Help'}</span>
      </button>

      <button
        onClick={() => setIsAuthOpen(true)}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-[#166534] text-[10px] font-semibold cursor-pointer"
      >
        <User className="w-5 h-5" />
        <span>{language === 'te' ? 'ఖాతా' : 'Account'}</span>
      </button>
    </nav>
  );
};
