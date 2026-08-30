import React from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const GroceryProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, cart, addToCart, updateCartQuantity } = useStore();

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const name = language === 'te' ? (product.nameTe || product.nameEn) : product.nameEn;
  const desc = language === 'te' 
    ? (product.descriptionTe || 'తాజా నాణ్యమైన గ్రామీణ కిరాణా సరుకులు') 
    : (product.descriptionEn || 'Locally sourced fresh daily village essentials');
  const unit = language === 'te' ? product.unitTe : product.unit;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-slate-400 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg">
      
      {/* Product Image Area matching Image 2 */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 mb-4 flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.nameEn}
          loading="lazy"
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Playful Tag Callout matching Image 2 */}
        {product.isDeal ? (
          <div className="absolute top-2 left-2 bg-[#9e1a22] text-white font-black text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>{discountPercent > 0 ? `${discountPercent}% OFF` : 'DEAL'}</span>
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            {unit}
          </div>
        )}

        {/* Quick Add Floating Bag Button matching Image 2 bottom-right circle icon */}
        <div className="absolute bottom-2 right-2">
          {isOutOfStock ? (
            <span className="bg-slate-200 text-slate-500 font-extrabold text-[10px] px-2 py-1 rounded-full">
              Sold Out
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-9 h-9 rounded-full bg-white hover:bg-[#9e1a22] text-slate-800 hover:text-white border border-slate-200 shadow-md flex items-center justify-center transition-all duration-200 transform active:scale-90 cursor-pointer"
              title="Add to cart"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center bg-[#9e1a22] text-white rounded-full shadow-md overflow-hidden border border-[#83181d]">
              <button
                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                className="w-7 h-8 flex items-center justify-center hover:bg-black/20 transition-colors cursor-pointer"
                aria-label="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1 text-xs font-black min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                className="w-7 h-8 flex items-center justify-center hover:bg-black/20 transition-colors cursor-pointer"
                aria-label="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Content Details matching Image 2 */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Title in bold uppercase */}
            <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide leading-tight line-clamp-1 group-hover:text-[#9e1a22] transition-colors">
              {name}
            </h4>
            {/* Tagline / Subtitle underneath in small grey */}
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-normal leading-snug">
              {desc}
            </p>
          </div>

          {/* Price on right */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs sm:text-sm font-black text-slate-900">
              ₹{product.price}
            </div>
            {product.mrp > product.price && (
              <div className="text-[10px] text-slate-400 line-through">
                ₹{product.mrp}
              </div>
            )}
          </div>
        </div>

        {/* Dual language helper */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>{language === 'te' ? product.nameEn : product.nameTe}</span>
          <span className="text-emerald-700 font-bold">⚡ 20 Min</span>
        </div>
      </div>

    </div>
  );
};
