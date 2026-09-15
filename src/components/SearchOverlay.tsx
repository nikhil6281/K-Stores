import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Check, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SearchOverlayProps {
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const categories = ['Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils', 'Pulses'];

  const results = (products || []).filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vegetables, dairy, rice, snacks..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="max-w-2xl mx-auto mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setQuery('')}
            className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${query === '' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setQuery(cat)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${query.toLowerCase() === cat.toLowerCase() ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4">
        <p className="text-xs text-slate-500 font-medium mb-3">
          {query ? `${results.length} items found for "${query}"` : `All Available Items (${results.length})`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-semibold text-sm">No grocery items found</p>
            <p className="text-slate-400 text-xs mt-1">Try searching "Tomato", "Milk", or "Rice"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">{product.nameEn}</h4>
                  <p className="text-[11px] text-slate-500">{product.category}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-emerald-700 text-sm">₹{product.price}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${added[product.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  >
                    {added[product.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{added[product.id] ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
