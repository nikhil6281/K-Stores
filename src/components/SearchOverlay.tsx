import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Check, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SearchOverlayProps { onClose: () => void; }

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filters = ['Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils', 'Pulses'];
  const results = (products || []).filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (p.nameEn || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{background:'rgba(4,8,20,0.92)',backdropFilter:'blur(16px)'}}>
      {/* Search header */}
      <div className="border-b border-navy-700/60 p-4" style={{background:'rgba(7,12,26,0.98)'}}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
            <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search vegetables, dairy, rice, snacks..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl text-white placeholder-slate-500 text-sm outline-none border border-navy-600 focus:border-amber-500/60 transition-colors"
              style={{background:'rgba(28,37,65,0.9)'}} />
            {query && <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border border-navy-600 text-slate-400 hover:text-white transition-colors" style={{background:'rgba(28,37,65,0.8)'}}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setQuery('')} className="px-3 py-1.5 rounded-xl text-xs text-amber-400 border border-amber-500/30 whitespace-nowrap" style={{background:'rgba(245,158,11,0.1)'}}>All</button>
          {filters.map(f => (
            <button key={f} onClick={() => setQuery(f)} className="px-3 py-1.5 rounded-xl text-xs text-slate-300 border border-navy-600 hover:border-amber-500/40 hover:text-amber-300 whitespace-nowrap transition-colors" style={{background:'rgba(28,37,65,0.7)'}}>{f}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto p-4">
        <p className="text-xs text-slate-500 mb-4">{query ? `${results.length} results for "${query}"` : `Showing all ${results.length} products`}</p>
        {results.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No products found</p>
            <p className="text-slate-600 text-xs mt-1">Try "Tomato", "Milk" or "Rice"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.map(product => (
              <div key={product.id} className="flex flex-col rounded-2xl border border-navy-700/60 hover:border-amber-500/30 overflow-hidden transition-all" style={{background:'rgba(11,19,43,0.9)'}}>
                <div className="aspect-square overflow-hidden" style={{background:'rgba(28,37,65,0.8)'}}>
                  <img src={product.image} alt={product.nameEn} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-white text-xs font-semibold line-clamp-1">{product.nameEn}</p>
                    <p className="text-slate-500 text-[10px]">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-700/50">
                    <span className="text-amber-400 font-bold text-sm">&#8377;{product.price}</span>
                    <button onClick={() => handleAdd(product)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={added[product.id] ? {background:'rgba(16,185,129,0.2)',color:'#34D399',border:'1px solid rgba(52,211,153,0.3)'} : {background:'rgba(245,158,11,0.15)',color:'#FCD34D',border:'1px solid rgba(245,158,11,0.3)'}}>
                      {added[product.id] ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {added[product.id] ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
