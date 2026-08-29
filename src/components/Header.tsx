import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Globe, 
  Store, 
  Clock, 
  Phone, 
  User, 
  Package, 
  X,
  ChevronDown
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE } from '../utils/whatsapp';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    cartItemsCount,
    cartSubtotal,
    setIsCartOpen,
    setIsHistoryOpen,
    setIsSupportOpen,
    setIsAuthOpen,
    setIsAdminLoginOpen,
    isOwnerMode,
    setIsOwnerMode,
    searchQuery,
    setSearchQuery,
    orders,
    user
  } = useStore();

  const [villageAddress, setVillageAddress] = useState('Grama Center, Main Road');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const pendingCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top village delivery badge & quick contact bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 shadow-sm">
              <Clock className="w-3 h-3" /> 20 MINS
            </span>
            <span className="hidden sm:inline">
              {language === 'te' 
                ? 'గ్రామంలో సూపర్ ఫాస్ట్ హోమ్ డెలివరీ • క్యాష్ ఆన్ డెలివరీ' 
                : 'Superfast Village Grocery Delivery • Cash on Delivery'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-100">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{STORE_OWNER_DISPLAY_PHONE}</span>
            </button>
            <span className="hidden md:inline">|</span>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="hidden md:inline hover:text-white underline text-[11px]"
            >
              {language === 'te' ? 'సహాయం & చిరునామా' : 'Help & Store Info'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo & Village Address Selector */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="cursor-pointer" onClick={() => { setSearchQuery(''); }}>
              <div className="flex items-center gap-1.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                  🌾
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-900 tracking-tight leading-none flex items-center gap-1">
                    <span>{t.storeName}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">20M</span>
                  </div>
                  <div className="text-[10px] font-medium text-emerald-700">
                    {language === 'te' ? 'మన ఊరి కిరాణా షాప్' : 'Village Kirana Express'}
                  </div>
                </div>
              </div>
            </div>

            {/* Location selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-left text-xs bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <div className="max-w-[140px] truncate">
                <div className="font-semibold text-slate-800 leading-tight">20 Min Delivery</div>
                <div className="text-[11px] text-slate-500 truncate">{villageAddress}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-200 transition-colors shadow-xs"
              title="Change Language / భాష మార్చండి"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Store Owner / Admin toggle */}
            <button
              onClick={() => {
                if (isOwnerMode) {
                  setIsOwnerMode(false);
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl transition-colors border shadow-xs ${
                isOwnerMode 
                  ? 'bg-purple-700 text-white border-purple-800 ring-2 ring-purple-400' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Store Owner Portal"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isOwnerMode ? (language === 'te' ? 'ఓనర్ మోడ్' : 'Owner Mode') : t.ownerPortal}
              </span>
            </button>

            {/* Orders History & Live Tracking */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition-colors"
            >
              <Package className="w-4 h-4 text-emerald-700" />
              <span>{t.myOrders}</span>
              {pendingCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Customer Profile / Login */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 transition-colors"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span className="max-w-[80px] truncate">{user ? user.name.split(' ')[0] : t.customerLogin}</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-emerald-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-emerald-200 font-medium">
                  {cartItemsCount} {t.items}
                </span>
                <span className="font-bold">₹{cartSubtotal}</span>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Select Village Area for 20-Min Delivery</span>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              We deliver within 20 minutes across all streets and neighborhoods in our village zone.
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Grama Center, Main Road',
                'Ramalayam Temple Street',
                'Panchayat Office & School Road',
                'Chinna Bazar & Rythu Bazaar',
                'Kothapet & Colony Area'
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setVillageAddress(loc);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors ${
                    villageAddress === loc 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                      : 'hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {villageAddress === loc && <span className="text-emerald-600 font-bold">✓ Selected</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-emerald-800"
            >
              Confirm Delivery Area
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
