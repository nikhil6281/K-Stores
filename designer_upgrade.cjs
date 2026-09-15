const fs = require('fs');
const path = require('path');

console.log("🎨 Applying World-Class UI/UX Design to RA General Store...");

// =====================================================================
// 1. GLOBAL CSS WITH STRICT IMAGE SAFETY & SYSTEM TYPOGRAPHY
// =====================================================================
fs.writeFileSync('./src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: #f8fafc;
  color: #0f172a;
  margin: 0;
  padding: 0;
}

/* Image Safety: Never allow images to overflow or blow up */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`, 'utf8');

fs.writeFileSync('./tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kirana: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
};
`, 'utf8');
console.log("✓ Global CSS & Image Safety configured");

// =====================================================================
// 2. HERO BANNER: Clean, Friendly Village Kirana Banner
// =====================================================================
fs.writeFileSync('./src/components/HeroBanner.tsx', `import React from 'react';
import { Clock, ShieldCheck, Truck, Phone, ArrowDown } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('products-section') || document.querySelector('main');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      {/* Main Friendly Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 text-white shadow-lg p-6 sm:p-10">
        {/* Soft background accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-900/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl">
          {/* Village Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Bommalatapalli Village Express Delivery</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            RA General Store
          </h1>

          <p className="mt-2 text-base sm:text-xl text-emerald-100 font-medium">
            Daily Fresh Groceries, Vegetables & Essentials Delivered in 20 Minutes
          </p>

          <p className="mt-1 text-xs sm:text-sm text-emerald-200/90">
            📍 on main road , Bommalatapalli beside chennampalli road • Everyday: 5:00 AM to 8:30 PM
          </p>

          {/* Feature Badges */}
          <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>20-Min Doorstep</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Quality Assured</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm text-white font-medium">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Cash on Delivery & UPI</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToProducts}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Groceries</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order%20groceries"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold rounded-xl text-sm transition-colors backdrop-blur-sm"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp: 62817 30144</span>
            </a>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div className="mt-3 bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm py-2 px-4 rounded-xl text-center shadow-sm">
        ✨ Special Offer: Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
      </div>
    </div>
  );
};
`, 'utf8');
console.log("✓ Redesigned HeroBanner.tsx with clean modern layout");

// =====================================================================
// 3. PRODUCT CARDS: Perfectly constrained square images, crisp prices
// =====================================================================
const productCardPath = './src/components/ProductCard.tsx';
if (fs.existsSync(productCardPath)) {
  fs.writeFileSync(productCardPath, `import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Product } from '../types';
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
          className={\`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm \${
            added
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
          }\`}
        >
          {added ? <Check className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4" />}
          <span>{added ? 'Added' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
};

export const GroceryProductCard = ProductCard;
`, 'utf8');
  console.log("✓ Re-engineered ProductCard.tsx with strict image constraints");
}

// =====================================================================
// 4. SEARCH OVERLAY: Clean, Fast Instant Search
// =====================================================================
fs.writeFileSync('./src/components/SearchOverlay.tsx', `import React, { useState, useEffect, useRef } from 'react';
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
            className={\`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors \${query === '' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}\`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setQuery(cat)}
              className={\`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors \${query.toLowerCase() === cat.toLowerCase() ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4">
        <p className="text-xs text-slate-500 font-medium mb-3">
          {query ? \`\${results.length} items found for "\${query}"\` : \`All Available Items (\${results.length})\`}
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
                    className={\`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors \${added[product.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}\`}
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
`, 'utf8');
console.log("✓ SearchOverlay.tsx ready");

// =====================================================================
// 5. ADMIN DASHBOARD: Add Camera Upload cleanly without tag breakage
// =====================================================================
const adminPath = './src/components/admin/AdminDashboard.tsx';
let admin = fs.readFileSync(adminPath, 'utf8');

// Replace label
admin = admin.replace('Product Image URL', 'Product Photo (Camera / Upload)');

// Replace ONLY the input tag
admin = admin.replace(
  /<input[^>]*value=\{newProduct\.image\}[^>]*\/>/,
  `<div className="flex items-center gap-3 mt-1">
    <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
      📷 Take Photo / Open Camera
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const max = 500;
              let w = img.width, h = img.height;
              if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
              else if (h > max) { w = Math.round(w * max / h); h = max; }
              canvas.width = w; canvas.height = h;
              canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
              setNewProduct((prev: any) => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.8) }));
            };
            img.src = evt.target?.result as string;
          };
          r.readAsDataURL(f);
        }}
      />
    </label>
    {newProduct.image ? (
      <span className="text-xs text-emerald-600 font-semibold">✓ Photo Ready</span>
    ) : (
      <span className="text-xs text-slate-400">Tap to snap photo</span>
    )}
  </div>`
);

admin = admin.replace(/తాజా\\s*టమాటాలు/g, 'Fresh Tomatoes');
fs.writeFileSync(adminPath, admin, 'utf8');
console.log("✓ AdminDashboard.tsx camera capture attached cleanly");

// =====================================================================
// 6. PURGE MOJIBAKE & CORRUPTED SYMBOLS GLOBALLY
// =====================================================================
function walk(dir) {
  let list = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(item.name)) list = list.concat(walk(full));
    } else if (/\.(tsx|ts|js|html)$/.test(item.name)) {
      list.push(full);
    }
  }
  return list;
}

let count = 0;
for (const file of walk('./src')) {
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;
  c = c.replace(/â‚¹|â,¹/g, '₹');
  c = c.replace(/â€¢|â•/g, '•');
  c = c.replace(/Ž%‰|Ž‰|Ž%/g, '✨');
  c = c.replace(/ðŸ›’|ðŸ>µ|ðŸµ|ðŸ|âš¡|“ž/g, '');
  if (c !== orig) {
    fs.writeFileSync(file, c, 'utf8');
    count++;
  }
}
console.log(`✓ Cleaned broken symbols in ${count} files`);

console.log("\n🎉 UI/UX Redesign complete! Ready to compile.");
