import React from 'react';
import { useStore } from '../context/StoreContext';
import type { ProductCategory } from '../types';

interface CategoryItem {
  id: ProductCategory | 'all';
  nameEn: string;
  nameTe: string;
  icon: string;
}

const categories: CategoryItem[] = [
  { id: 'all', nameEn: 'All Items', nameTe: 'à°…à°¨à±à°¨à±€', icon: 'ðŸ›’' },
  { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'à°•à±‚à°°à°—à°¾à°¯à°²à±', icon: 'ðŸ¥¬' },
  { id: 'fruits', nameEn: 'Fruits', nameTe: 'à°ªà°‚à°¡à±à°²à±', icon: 'ðŸŽ' },
  { id: 'dairy', nameEn: 'Dairy & Bread', nameTe: 'à°ªà°¾à°²à± & à°¬à±à°°à±†à°¡à±', icon: 'ðŸ¥›' },
  { id: 'staples', nameEn: 'Rice & Atta & Dal', nameTe: 'à°¬à°¿à°¯à±à°¯à°‚ & à°ªà°ªà±à°ªà±à°²à±', icon: 'ðŸŒ¾' },
  { id: 'snacks', nameEn: 'Snacks & Biscuits', nameTe: 'à°¸à±à°¨à°¾à°•à±à°¸à± & à°¬à°¿à°¸à±à°•à±†à°Ÿà±à°²à±', icon: 'ðŸª' },
  { id: 'spices', nameEn: 'Spices & Oils', nameTe: 'à°®à°¸à°¾à°²à°¾à°²à± & à°¨à±‚à°¨à±†à°²à±', icon: 'ðŸŒ¶ï¸' },
  { id: 'beverages', nameEn: 'Tea, Coffee & Drinks', nameTe: 'à°Ÿà±€, à°•à±‚à°²à± à°¡à±à°°à°¿à°‚à°•à±à°¸à±', icon: 'ðŸ§ƒ' },
  { id: 'household', nameEn: 'Household Cleaners', nameTe: 'à°‡à°‚à°Ÿà°¿ à°¶à±à°­à±à°°à°¤', icon: 'ðŸ§¼' },
  { id: 'personal_care', nameEn: 'Soaps & Care', nameTe: 'à°¸à°¬à±à°¬à±à°²à±', icon: 'ðŸ§´' },
  { id: 'pooja', nameEn: 'Pooja Samagri', nameTe: 'à°ªà±‚à°œà°¾ à°¸à°¾à°®à°¾à°—à±à°°à°¿', icon: 'ðŸª”' },
];

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language, products } = useStore();

  const getCount = (catId: ProductCategory | 'all') => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="sticky top-[95px] sm:top-[105px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-[#166534] text-white border-[#14532d] shadow-sm ring-2 ring-[#166534]/30'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/70'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{language === 'te' ? cat.nameTe : cat.nameEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                isSelected ? 'bg-[#14532d] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

