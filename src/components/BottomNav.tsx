import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Home, 
  Layers, 
  Package, 
  Phone, 
  ShoppingBag 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    cartItemsCount,
    setIsCartOpen,
    setIsHistoryOpen,
    setIsSupportOpen,
    setSelectedCategory,
    setSearchQuery,
    orders,
    language,
    t
  } = useStore();

  const pendingCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#166534] p-1"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'te' ? 'à°¹à±‹à°®à±' : 'Home'}</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#166534] p-1"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'te' ? 'à°µà°¿à°­à°¾à°—à°¾à°²à±' : 'Categories'}</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#166534] p-1"
        >
          <Package className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-[#166534] rounded-full animate-ping" />
          )}
          <span className="text-[10px] font-bold">{language === 'te' ? 'à°†à°°à±à°¡à°°à±à°²à±' : 'Orders'}</span>
        </button>

        {/* Support */}
        <button
          onClick={() => setIsSupportOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-[#166534] p-1"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'te' ? 'à°¸à°¹à°¾à°¯à°‚' : 'Help'}</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[#166534] p-1"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#166534]" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black">{t.cart}</span>
        </button>

      </div>
    </div>
  );
};

