import React, { useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, Plus } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const { products, searchQuery, setSearchQuery, addToCart, language } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = (searchQuery || '').toLowerCase().trim();
  const matchedProducts = products.filter(p => {
    if (!q) return true;
    const nameEn = (p.nameEn || '').toLowerCase();
    const nameTe = (p.nameTe || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return nameEn.includes(q) || nameTe.includes(q) || cat.includes(q);
  }).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'te' ? 'à°¸à°°à±à°•à±à°²à± à°µà±†à°¤à°•à°‚à°¡à°¿ (à°Ÿà°®à°¾à°Ÿà°¾à°²à±, à°ªà°¾à°²à±, à°¬à°¿à°¯à±à°¯à°‚...)' : 'Search fresh groceries, staples, snacks...'}
            className="flex-1 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {q ? `Products (${matchedProducts.length})` : 'Popular Fresh Groceries'}
            </h4>
            {q && (
              <span className="text-[11px] text-slate-400">
                Press ESC to close
              </span>
            )}
          </div>

          {matchedProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="text-3xl">ðŸ”</div>
              <p className="text-sm font-semibold text-slate-700">No products matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400">Try searching for vegetables, milk, rice, or oils.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {matchedProducts.map((product) => {
                const name = language === 'te' ? (product.nameTe || product.nameEn) : product.nameEn;
                const unit = language === 'te' ? product.unitTe : product.unit;

                return (
                  <div
                    key={product.id}
                    className="group bg-slate-50 hover:bg-white p-3 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-2.5">
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1 leading-tight">
                        {name}
                      </h5>
                      <div className="text-[10px] text-slate-500">{unit}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60">
                      <span className="font-extrabold text-xs text-slate-900">â‚¹{product.price}</span>
                      <button
                        onClick={() => {
                          addToCart(product);
                        }}
                        className="w-7 h-7 rounded-full bg-[#166534] hover:bg-[#14532d] text-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                        title="Add to cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>âš¡ Fast 20-minute village delivery on all orders</span>
          <button
            onClick={onClose}
            className="text-[#166534] font-bold hover:underline"
          >
            View Full Catalog â†’
          </button>
        </div>
      </div>
    </div>
  );
};

