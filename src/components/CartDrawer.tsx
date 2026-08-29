import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Zap, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    cartItemsCount,
    deliveryType,
    setDeliveryType,
    deliveryFee,
    minOrderForFreeDelivery,
    setIsCheckoutOpen,
    language,
    t
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryProgress = Math.min(100, (cartSubtotal / minOrderForFreeDelivery) * 100);
  const remainingForFreeDelivery = Math.max(0, minOrderForFreeDelivery - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-left">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">{t.yourCart}</h2>
              <p className="text-xs text-slate-500">{cartItemsCount} {t.items}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-600 p-2 rounded-lg flex items-center gap-1 transition-colors"
                title={t.clearCart}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4 border border-emerald-100 shadow-inner">
              🛒
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">{t.emptyCartTitle}</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
              {t.emptyCartSubtitle}
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Delivery Type Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">{t.deliveryMode}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryType('delivery_20min')}
                  className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                    deliveryType === 'delivery_20min'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>20-Min Home</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {deliveryFee === 0 ? 'FREE Delivery' : '₹15 Village Delivery'}
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryType('store_pickup')}
                  className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                    deliveryType === 'store_pickup'
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Store Pickup</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Ready in 5 mins (FREE)</div>
                </button>
              </div>
            </div>

            {/* Free Delivery Bar */}
            {deliveryType === 'delivery_20min' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1.5">
                  {cartSubtotal >= minOrderForFreeDelivery ? (
                    <span className="flex items-center gap-1 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {t.freeDeliveryEligible}
                    </span>
                  ) : (
                    <span>{t.addMoreForFreeDelivery.replace('{amount}', remainingForFreeDelivery.toString())}</span>
                  )}
                  <span className="text-[11px] font-extrabold">{Math.round(freeDeliveryProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-amber-200/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Itemized List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700">{language === 'te' ? 'సరుకుల జాబితా' : 'Cart Items'}</div>
              {cart.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-800 truncate">
                        {language === 'te' ? product.nameTe : product.nameEn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {language === 'te' ? product.unitTe : product.unit} • ₹{product.price}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-emerald-700 text-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 hover:bg-emerald-800 text-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold min-w-[18px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="px-2 py-1 hover:bg-emerald-800 text-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[50px] font-bold text-xs text-slate-900">
                      ₹{product.price * quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 mb-1">{t.billDetails}</div>
              
              <div className="flex justify-between text-slate-600">
                <span>{t.itemTotal}</span>
                <span>₹{cartSubtotal}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t.mrpSavings}
                  </span>
                  <span>-₹{cartDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>{t.deliveryFee}</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">{t.free}</span> : `₹${deliveryFee}`}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>{t.toPay}</span>
                <span className="text-base text-emerald-800">₹{cartTotal}</span>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{language === 'te' ? 'క్యాష్ ఆన్ డెలివరీ (సరుకులు వచ్చాక చెల్లించండి)' : 'Cash / UPI on Delivery. No advance payment required.'}</span>
              </div>
            </div>

          </div>
        )}

        {/* Footer Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="text-left leading-tight">
                <div className="text-xs text-emerald-200 font-medium">{cartItemsCount} {t.items} | ₹{cartTotal}</div>
                <div className="text-sm font-bold">{t.proceedToCheckout}</div>
              </div>
              <div className="flex items-center gap-1 bg-emerald-900/50 px-3 py-1.5 rounded-xl text-xs font-bold">
                <span>{language === 'te' ? 'ముందుకు వెళ్ళండి' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
