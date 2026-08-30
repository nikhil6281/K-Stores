import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    cartItemsCount,
    setIsCheckoutOpen,
    user,
    setIsAuthOpen,
    showToast,
    language
  } = useStore();

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'VILLAGE20' || code === 'SAVOR20' || code === 'KSTORES') {
      setAppliedPromo(code);
      showToast('success', 'Promo Code Applied!', 'You received extra village savings on this order.');
    } else {
      showToast('error', 'Invalid Code', 'Try promo code VILLAGE20 for 20% off.');
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      showToast('warning', 'Sign in Required', language === 'te' ? 'ఆర్డర్ చేయడానికి దయచేసి లాగిన్ అవ్వండి' : 'Please sign in to proceed with checkout.');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-left border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header matching Image 5: CART (X) + Circular Close Button */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg sm:text-xl text-slate-900 tracking-wider uppercase font-sans">
              CART
            </h2>
            <span className="bg-slate-100 text-slate-700 font-black text-xs px-2 py-0.5 rounded-full">
              {cartItemsCount}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-800 text-base mb-1">Your cart is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6">
              Browse our fresh farm produce and village groceries for superfast 20-minute delivery.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="bg-[#9e1a22] hover:bg-[#83181d] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Shop Groceries
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Cart Items List matching Image 5 */}
            <div className="space-y-4">
              {cart.map(({ product, quantity }) => {
                const name = language === 'te' ? (product.nameTe || product.nameEn) : product.nameEn;
                const unit = language === 'te' ? product.unitTe : product.unit;
                const itemTotal = product.price * quantity;

                return (
                  <div 
                    key={product.id}
                    className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden p-1 flex-shrink-0 border border-slate-100">
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details & Stepper */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate">
                          {name}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {quantity} {quantity > 1 ? 'Units' : 'Unit'} ({unit})
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          ₹{product.price}
                        </div>
                      </div>

                      {/* Stepper & Trash matching Image 5: [ - 1 + ] [ 🗑️ ] */}
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900 min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price on right */}
                    <div className="text-right font-black text-xs sm:text-sm text-slate-900">
                      ₹{itemTotal}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collapsible Discount Box matching Image 5: Discount + */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsDiscountOpen(!isDiscountOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-2 border-b border-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Discount</span>
                  {appliedPromo && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {appliedPromo} (ACTIVE)
                    </span>
                  )}
                </div>
                {isDiscountOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isDiscountOpen && (
                <form onSubmit={handleApplyPromo} className="pt-3 flex gap-2 animate-scale-up">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo (e.g. VILLAGE20)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono focus:border-[#9e1a22] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Footer matching Image 5: Estimated Total + CHECK OUT Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white space-y-3">
            
            {/* Estimated total row */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">
                Estimated total
              </span>
              <span className="font-black text-base sm:text-lg text-slate-900 font-sans">
                ₹{cartTotal}
              </span>
            </div>

            {/* Subtext matching Image 5 */}
            <p className="text-[11px] text-slate-500 leading-tight">
              Taxes and 20-min village delivery calculated at checkout.
            </p>

            {/* Big bold crimson CHECK OUT button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#9e1a22] hover:bg-[#83181d] active:scale-98 text-white font-black py-4 px-6 rounded-2xl shadow-xl text-xs sm:text-sm uppercase tracking-widest transition-all cursor-pointer text-center font-sans"
            >
              CHECK OUT
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
