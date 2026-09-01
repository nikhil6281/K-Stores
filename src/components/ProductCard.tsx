import React from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, Flame } from 'lucide-react';
import type { Product } from '../types';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity, language } = useStore();

  const cartItem = cart.find(item => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-3 sm:p-4 flex flex-col justify-between group">
      
      {/* Top Image & Badge */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3">
        <img
          src={product.image}
          alt={product.nameEn}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {product.isDeal && (
          <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <Flame className="w-3 h-3 fill-slate-950" />
            <span>DEAL</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
          {language === 'te' && product.nameTe ? product.nameTe : product.nameEn}
        </h3>
        {product.nameTe && language === 'en' && (
          <p className="text-[11px] text-slate-500 line-clamp-1">{product.nameTe}</p>
        )}
        <p className="text-[11px] text-slate-400 font-medium">
          {language === 'te' ? product.unitTe : product.unit}
        </p>
      </div>

      {/* Price & Action Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="font-extrabold text-slate-900 text-sm sm:text-base">
            ₹{product.price}
          </div>
          {product.mrp > product.price && (
            <div className="text-[11px] text-slate-400 line-through">
              ₹{product.mrp}
            </div>
          )}
        </div>

        <div>
          {qtyInCart === 0 ? (
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className="bg-emerald-50 hover:bg-[#166534] text-[#166534] hover:text-white border border-[#166534]/30 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'చేర్చండి' : 'ADD'}</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#166534] text-white rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={() => updateCartQuantity(product.id, qtyInCart - 1)}
                className="p-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-extrabold text-xs">
                {qtyInCart}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, qtyInCart + 1)}
                className="p-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
