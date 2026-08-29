import React from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const GroceryProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t, cart, addToCart, updateCartQuantity } = useStore();

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
      isOutOfStock ? 'opacity-70 border-slate-200' : 'border-slate-200 hover:border-emerald-500/50'
    }`}>
      
      {/* Top Image Container */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden p-3 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.nameEn}
          loading="lazy"
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
        />

        {/* 20 Min Delivery Pill */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs border border-emerald-200">
          <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
          <span>20 MINS</span>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-emerald-950 font-black px-1.5 py-0.5 rounded-md text-[10px] shadow-xs">
            {discountPercent}% {t.off}
          </div>
        )}

        {/* Veg Badge */}
        {product.isVeg && (
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-white rounded border border-emerald-600 flex items-center justify-center p-0.5 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Unit Badge */}
          <div className="text-[11px] font-semibold text-slate-500 mb-0.5">
            {language === 'te' ? product.unitTe : product.unit}
          </div>

          {/* Primary Name (Current Language) */}
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {language === 'te' ? product.nameTe : product.nameEn}
          </h3>

          {/* Secondary Subtitle Name (Dual Language Aid) */}
          <div className="text-[11px] text-slate-500 line-clamp-1 font-medium">
            {language === 'te' ? product.nameEn : product.nameTe}
          </div>
        </div>

        {/* Stock Alert Warning */}
        {isLowStock && !isOutOfStock && (
          <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block w-fit">
            {t.lowStock.replace('{count}', product.stock.toString())}
          </div>
        )}

        {/* Price & Add to Cart Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-[11px] text-slate-400 line-through font-normal">
                  ₹{product.mrp}
                </span>
              )}
            </div>
            {product.mrp > product.price && (
              <div className="text-[10px] font-semibold text-emerald-700">
                {language === 'te' ? `₹${product.mrp - product.price} ఆదా` : `Save ₹${product.mrp - product.price}`}
              </div>
            )}
          </div>

          {/* Add Button or Stepper */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="bg-slate-100 text-slate-400 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed border border-slate-200"
              >
                {t.outOfStock}
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-600/40 px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all transform active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>{t.add}</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden border border-emerald-800">
                <button
                  onClick={() => updateCartQuantity(product.id, quantity - 1)}
                  className="px-2.5 py-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-xs font-black min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateCartQuantity(product.id, quantity + 1)}
                  className="px-2.5 py-1.5 hover:bg-emerald-800 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
