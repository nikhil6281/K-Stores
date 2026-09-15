import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between">
      <div>
        {/* Product Image: Strictly Constrained Aspect Ratio */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
          <img
            src={product.image}
            alt={product.nameEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.unit && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
              {product.unit}
            </span>
          )}
        </div>

        {/* Product Meta */}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
          {product.category}
        </span>
        <h3 className="mt-1.5 font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {product.nameEn}
        </h3>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            added
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
          }`}
        >
          {added ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4" />}
          <span>{added ? 'Added' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
};

export const GroceryProductCard = ProductCard;
