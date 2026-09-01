import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  Carrot, 
  Apple, 
  Milk, 
  Wheat, 
  Cookie, 
  Coffee, 
  Home, 
  Heart, 
  Flame 
} from 'lucide-react';
import type { ProductCategory } from '../types';

interface CategoryItem {
  id: ProductCategory;
  labelEn: string;
  labelTe: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', labelEn: 'All Items', labelTe: 'అన్నీ', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'vegetables', labelEn: 'Vegetables', labelTe: 'కూరగాయలు', icon: <Carrot className="w-4 h-4" /> },
  { id: 'fruits', labelEn: 'Fruits', labelTe: 'పండ్లు', icon: <Apple className="w-4 h-4" /> },
  { id: 'dairy', labelEn: 'Dairy & Eggs', labelTe: 'పాలు & గుడ్లు', icon: <Milk className="w-4 h-4" /> },
  { id: 'staples', labelEn: 'Staples & Atta', labelTe: 'బియ్యం & పిండి', icon: <Wheat className="w-4 h-4" /> },
  { id: 'snacks', labelEn: 'Snacks', labelTe: 'స్నాక్స్', icon: <Cookie className="w-4 h-4" /> },
  { id: 'beverages', labelEn: 'Beverages', labelTe: 'టీ & కాఫీ', icon: <Coffee className="w-4 h-4" /> },
  { id: 'household', labelEn: 'Household', labelTe: 'క్లీనర్స్', icon: <Home className="w-4 h-4" /> },
  { id: 'personal_care', labelEn: 'Personal Care', labelTe: 'కేర్', icon: <Heart className="w-4 h-4" /> },
  { id: 'pooja', labelEn: 'Pooja Needs', labelTe: 'పూజ వస్తువులు', icon: <Flame className="w-4 h-4" /> },
];

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language } = useStore();

  return (
    <div className="sticky top-[58px] sm:top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-slate-500'}>
                {cat.icon}
              </span>
              <span>{language === 'te' ? cat.labelTe : cat.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
