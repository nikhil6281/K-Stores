import React, { useMemo, useState } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { PromotionsTicker } from './components/PromotionsTicker';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { GroceryProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { CustomerSupportModal } from './components/CustomerSupportModal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { FAQSection } from './components/FAQSection';
import { 
  Zap, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Heart,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE, STORE_OWNER_PHONE, getWhatsAppSupportUrl } from './utils/whatsapp';

export const AppContent: React.FC = () => {
  const {
    isOwnerMode,
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    activeOrder,
    setIsTrackingOpen,
    setIsSupportOpen,
    language,
    t
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'discount'>('featured');

  // Filter and sort products by category, search query, and sorting selection
  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = (searchQuery || '').toLowerCase().trim();
      if (!q) return matchesCategory;

      const pNameEn = (p.nameEn || '').toLowerCase();
      const pNameTe = (p.nameTe || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pDescEn = (p.descriptionEn || '').toLowerCase();
      const pDescTe = (p.descriptionTe || '').toLowerCase();

      const matchesSearch = pNameEn.includes(q) ||
        pNameTe.includes(q) ||
        pCat.includes(q) ||
        pDescEn.includes(q) ||
        pDescTe.includes(q);

      return matchesCategory && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price-high') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'discount') {
        const discA = Math.max(0, (a.mrp ?? a.price) - a.price);
        const discB = Math.max(0, (b.mrp ?? b.price) - b.price);
        return discB - discA;
      }
      // 'featured': deals first, then by in-stock status
      if (a.isDeal && !b.isDeal) return -1;
      if (!a.isDeal && b.isDeal) return 1;
      if (a.stock > 0 && b.stock <= 0) return -1;
      if (a.stock <= 0 && b.stock > 0) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Deal products
  const dealProducts = useMemo(() => {
    return products.filter(p => p.isDeal && p.stock > 0).slice(0, 4);
  }, [products]);

  // If in Store Owner mode, render the Admin Portal
  if (isOwnerMode) {
    return (
      <div className="min-h-screen bg-slate-900">
        <AdminDashboard />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900 pb-16 md:pb-0">
      
      {/* Toast Notifications */}
      <ToastContainer />

      <div>
        {/* Header Navigation */}
        <Header />

        {/* Dynamic Promotions Notice Ticker */}
        <PromotionsTicker />

        {/* Hero Section with 20-min delivery promise */}
        <HeroBanner />

        {/* Category Navigation Bar */}
        <CategoryNav />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          
          {/* Active Deals of the Day (Only on 'all' and when not searching) */}
          {selectedCategory === 'all' && !searchQuery && dealProducts.length > 0 && (
            <section id="deals-section" className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ”¥
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 font-sans">
                      {language === 'te' ? 'à°¨à±‡à°Ÿà°¿ à°ªà±à°°à°¤à±à°¯à±‡à°• à°†à°«à°°à±à°²à± & à°¡à±€à°²à±à°¸à±' : 'Deals of the Day'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'te' ? 'à°¤à°•à±à°•à±à°µ à°§à°°à°²à±à°²à±‹ à°¤à°¾à°œà°¾ à°¸à°°à±à°•à±à°²à±' : 'Super savings on fresh essentials'}
                    </p>
                  </div>
                </div>

                <span className="bg-red-50 text-[#166534] font-extrabold text-[11px] px-3 py-1 rounded-full border border-red-200">
                  {language === 'te' ? 'à°ªà°°à°¿à°®à°¿à°¤ à°¸à±à°Ÿà°¾à°•à±' : 'Limited Stock'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                {dealProducts.map(product => (
                  <GroceryProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Product Catalog Grid */}
          <section id="catalog-section" className="space-y-4 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 font-sans">
                  <span>{searchQuery ? `Search results for "${searchQuery}"` : selectedCategory === 'all' ? t.all : selectedCategory.toUpperCase()}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    {filteredProducts.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'te' ? '20 à°¨à°¿à°®à°¿à°·à°¾à°²à±à°²à±‹ à°®à±€ à°‡à°‚à°Ÿà°¿ à°®à±à°‚à°¦à±à°•à±' : 'Delivered in 20 minutes to your village address'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#166534] hover:text-[#14532d] font-bold underline cursor-pointer mr-1"
                  >
                    Clear search
                  </button>
                )}

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-low' | 'price-high' | 'discount')}
                    className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="featured">{language === 'te' ? 'à°«à±€à°šà°°à±à°¡à± & à°¡à±€à°²à±à°¸à±' : 'Featured & Deals'}</option>
                    <option value="price-low">{language === 'te' ? 'à°§à°°: à°¤à°•à±à°•à±à°µ à°¨à±à°‚à°¡à°¿ à°Žà°•à±à°•à±à°µ' : 'Price: Low to High'}</option>
                    <option value="price-high">{language === 'te' ? 'à°§à°°: à°Žà°•à±à°•à±à°µ à°¨à±à°‚à°¡à°¿ à°¤à°•à±à°•à±à°µ' : 'Price: High to Low'}</option>
                    <option value="discount">{language === 'te' ? 'à°Žà°•à±à°•à±à°µ à°¡à°¿à°¸à±à°•à±Œà°‚à°Ÿà±' : 'Highest Discount'}</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-3">
                  ”
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  {language === 'te' ? 'à°¸à°°à±à°•à±à°²à± à°•à°¨à±à°—à±Šà°¨à°¬à°¡à°²à±‡à°¦à±' : 'No items found'}
                </h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  {language === 'te' 
                    ? 'à°®à±€à°°à± à°µà±†à°¤à±à°•à±à°¤à±à°¨à±à°¨ à°µà°¸à±à°¤à±à°µà± à°¸à±à°Ÿà°¾à°•à±â€Œà°²à±‹ à°²à±‡à°•à°ªà±‹à°µà°šà±à°šà±. à°¦à°¯à°šà±‡à°¸à°¿ à°µà±‡à°°à±‡ à°ªà±‡à°°à±à°¤à±‹ à°µà±†à°¤à°•à°‚à°¡à°¿ à°²à±‡à°¦à°¾ à°“à°¨à°°à±â€Œà°•à°¿ à°µà°¾à°Ÿà±à°¸à°¾à°ªà± à°šà±‡à°¯à°‚à°¡à°¿.'
                    : 'We could not find the item you are searching for. You can request it directly from the store owner.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="bg-[#166534] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {filteredProducts.map(product => (
                  <GroceryProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Village Fast Delivery Promise Banner */}
          <section id="delivery-promise-section" className="bg-[#166534] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#14532d]">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-black text-xs px-3 py-1 rounded-full shadow-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>20-MINUTE VILLAGE BLINKIT EXPERIENCE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {language === 'te' 
                  ? 'à°®à±€à°•à± à°•à°¾à°µà°¾à°²à±à°¸à°¿à°¨ à°à°¦à±ˆà°¨à°¾ à°•à°¿à°°à°¾à°£à°¾ à°µà°¸à±à°¤à±à°µà± à°²à±‡à°¦à°¾ à°ªà°¾à°²à± 20 à°¨à°¿à°®à°¿à°·à°¾à°²à±à°²à±‹ à°šà±‡à°°à°µà±‡à°¸à±à°¤à°¾à°®à±!'
                  : 'Get all your daily kirana essentials delivered to your doorstep in 20 minutes!'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                {language === 'te'
                  ? 'à°•à±à°¯à°¾à°·à± à°†à°¨à± à°¡à±†à°²à°¿à°µà°°à±€ â€¢ à°µà°¾à°Ÿà±à°¸à°¾à°ªà±â€Œà°²à±‹ à°¸à±à°²à°­à°‚à°—à°¾ à°¬à°¿à°²à±à°²à± â€¢ à°·à°¾à°ªà± à°µà°¦à±à°¦ à°‰à°šà°¿à°¤ à°ªà°¿à°•à°ªà±'
                  : 'Cash on Delivery â€¢ WhatsApp itemized billing â€¢ 100% genuine local kirana products'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <a
                href={getWhatsAppSupportUrl(language)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                <span>WhatsApp Store (+91 62817 30144)</span>
              </a>

              <a
                href={`tel:+${STORE_OWNER_PHONE}`}
                className="w-full sm:w-auto bg-emerald-900/80 hover:bg-emerald-950 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-emerald-500/40 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>Call Store</span>
              </a>
            </div>
          </section>

          {/* Interactive FAQs */}
          <FAQSection />

        </main>
      </div>

      {/* Floating Active Order Tracker Pill (If an active order exists) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-40 animate-bounce-subtle">
          <button
            onClick={() => setIsTrackingOpen(true)}
            className="bg-emerald-900 text-white border-2 border-amber-400 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-extrabold hover:bg-black transition-all cursor-pointer"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-amber-300 font-bold">20-Min Order #{activeOrder.id}</div>
              <div className="font-bold capitalize">{activeOrder.status.replace('_', ' ')} ›µ</div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 ml-1" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 text-xs mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Store Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg">
                  
                </div>
                <div>
                  <span className="font-extrabold text-white text-base">{t.storeName}</span>
                  <div className="text-[10px] text-emerald-400">{t.tagline}</div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {language === 'te'
                  ? 'à°®à°¨ à°—à±à°°à°¾à°® à°ªà±à°°à°œà°² à°•à±‹à°¸à°‚ à°ªà±à°°à°¤à±à°¯à±‡à°•à°‚à°—à°¾ à°ªà±à°°à°¾à°°à°‚à°­à°¿à°‚à°šà°¿à°¨ 20 à°¨à°¿à°®à°¿à°·à°¾à°² à°¸à±‚à°ªà°°à± à°«à°¾à°¸à±à°Ÿà± à°•à°¿à°°à°¾à°£à°¾ à°¡à±†à°²à°¿à°µà°°à±€ à°¯à°¾à°ªà±.'
                  : 'Everyday farm-fresh groceries delivered in 20 minutes.'}
              </p>
            </div>

            {/* Col 2: 20-Min Service Highlights */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-sm">
                {language === 'te' ? 'à°¸à±‡à°µà°¾ à°µà°¿à°¶à±‡à°·à°¾à°²à±' : 'Store Highlights'}
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>20-Minute Delivery Guarantee</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash on Delivery / UPI at Door</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                  <span>Direct WhatsApp Bill to Owner</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Store Pickup in 5 Minutes</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Store Contact & Address */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-sm">
                {t.contactUs}
              </h4>
              <div className="space-y-1.5 text-slate-400">
                <div className="font-semibold text-slate-200">{t.storeOwnerName}</div>
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{STORE_OWNER_DISPLAY_PHONE}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{t.storeAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.storeHours}</span>
                </div>
              </div>
            </div>

            {/* Col 4: Village Fast Access */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-sm">
                {language === 'te' ? 'à°“à°¨à°°à± à°ªà±‹à°°à±à°Ÿà°²à±' : 'Store Owner Portal'}
              </h4>
              <p className="text-slate-400 text-[11px]">
                {language === 'te' 
                  ? 'à°·à°¾à°ªà± à°“à°¨à°°à± à°²à±ˆà°µà± à°†à°°à±à°¡à°°à±à°²à± à°®à°°à°¿à°¯à± à°¸à±à°Ÿà°¾à°•à± à°¨à°¿à°²à±à°µà°²à°¨à± à°¨à°¿à°°à±à°µà°¹à°¿à°‚à°šà°¡à°¾à°¨à°¿à°•à°¿ à°‡à°•à±à°•à°¡ à°²à°¾à°—à°¿à°¨à± à°…à°µà±à°µà°‚à°¡à°¿.' 
                  : 'Access owner dashboard to manage incoming orders and stock.'}
              </p>
              <button
                onClick={() => setIsSupportOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Contact Store</span>
              </button>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Â© {new Date().getFullYear()} {t.storeName}. {t.footerRights}</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for our local village community
            </span>
          </div>

        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* All Drawers & Modals */}
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <OrderHistoryModal />
      <CustomerSupportModal />
      <AuthModal />
      <AdminLoginModal />

    </div>
  );
};

export default function App() {
  return <AppContent />;
}


