import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  Globe, 
  Store, 
  User, 
  Package
} from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    cartItemsCount,
    setIsCartOpen,
    setIsHistoryOpen,
    setIsAuthOpen,
    setIsAdminLoginOpen,
    isOwnerMode,
    setIsOwnerMode,
    setSelectedCategory,
    orders,
    user
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const pendingCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#166534] text-white shadow-md border-b border-[#14532d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Main Nav Links */}
          <div className="flex items-center gap-6 lg:gap-10">
            {/* SAVOR-style Brand Logo Badge */}
            <div 
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer group flex items-center gap-2"
            >
              <div className="bg-black/30 group-hover:bg-black/50 border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all">
                <span className="text-xl">ðŸŒ¾</span>
                <span className="font-black text-lg sm:text-xl tracking-wider text-white uppercase font-sans">
                  K-STORES
                </span>
              </div>
            </div>

            {/* Navigation Links matching Image 1 */}
            <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-extrabold uppercase tracking-widest text-white/90">
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  scrollToSection('catalog-section');
                }}
                className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white"
              >
                SHOP
              </button>

              <button 
                onClick={() => scrollToSection('delivery-promise-section')}
                className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white"
              >
                ABOUT
              </button>

              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  scrollToSection('deals-section');
                }}
                className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white flex items-center gap-1"
              >
                <span>RECIPES & DEALS</span>
                <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  HOT
                </span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons: Language, Owner, Search, User, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'à°¤à±†à°²à±à°—à±' : 'English'}</span>
            </button>

            {/* Store Owner Button */}
            <button
              onClick={() => {
                if (isOwnerMode) {
                  setIsOwnerMode(false);
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border cursor-pointer ${
                isOwnerMode 
                  ? 'bg-amber-400 text-black border-amber-300 font-extrabold shadow-sm' 
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Store Owner Portal"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isOwnerMode ? 'Owner Active' : 'Owner'}
              </span>
            </button>

            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Search products"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Orders Icon */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="My Orders"
              aria-label="My Orders"
            >
              <Package className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Icon Trigger (opens Image 4 AuthModal) */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title={user ? `Signed in as ${user.name}` : 'Sign in or create account'}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="hidden lg:inline text-xs font-bold max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Cart Trigger with Circular Badge (matching Image 1 & 5) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="View Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="bg-white text-[#166534] font-black text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md">
                {cartItemsCount}
              </span>
            </button>

          </div>

        </div>
      </header>

      {/* Instant Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

