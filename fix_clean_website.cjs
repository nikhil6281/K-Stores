const fs = require('fs');
const path = require('path');

console.log("Cleaning and perfecting website...");

// =====================================================================
// 1. CLEAN STYLING (Fast, standard system fonts, fresh kirana theme)
// =====================================================================
fs.writeFileSync('./src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  scroll-behavior: smooth;
}
body {
  background-color: #f8fafc;
  color: #0f172a;
}
`, 'utf8');

fs.writeFileSync('./tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`, 'utf8');

// Remove extra font links from index.html
let html = fs.readFileSync('./index.html', 'utf8');
html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>/gi, '');
html = html.replace(/<link[^>]*fonts\.gstatic[^>]*>/gi, '');
html = html.replace(/<link[^>]*preconnect[^>]*>/gi, '');
html = html.replace(/<title>.*?<\/title>/, '<title>RA General Store - Fresh Groceries & Village Delivery</title>');
fs.writeFileSync('./index.html', html, 'utf8');
console.log("✓ Reset index.css, tailwind.config.js & index.html to clean fast styling");

// =====================================================================
// 2. CLEAN & USER-FRIENDLY HERO BANNER (Fresh Green, White Text)
// =====================================================================
fs.writeFileSync('./src/components/HeroBanner.tsx', `import React from 'react';
import { Clock, ShieldCheck, Truck, Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white py-10 sm:py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs sm:text-sm font-semibold mb-3">
            ✨ Bommalatapalli Village Express
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            RA General Store
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 font-medium mb-1">
            Fresh Farm Groceries Delivered in 20 Minutes
          </p>
          <p className="text-xs sm:text-sm text-emerald-200">
            on main road , Bommalatapalli beside chennampalli road
          </p>
          <p className="text-xs text-emerald-200/90 mt-1">
            Open Everyday: 5:00 AM to 8:30 PM
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>20-Min Fast Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Quality Assured</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-full">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Cash on Delivery & UPI</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
            <button
              onClick={scrollToProducts}
              className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
            >
              Shop Groceries Now
            </button>
            <a
              href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order%20groceries"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp: 62817 30144</span>
            </a>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div className="bg-amber-300 text-slate-900 py-2 px-4 text-center text-xs sm:text-sm font-bold shadow-sm">
        Special Offer: Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
      </div>
    </div>
  );
};
`, 'utf8');
console.log("✓ Created clean, pleasant HeroBanner.tsx");

// =====================================================================
// 3. WORKING, USER-FRIENDLY SEARCH OVERLAY
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
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border-2 border-emerald-500 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white"
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

        {/* Category Pills */}
        <div className="max-w-2xl mx-auto mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setQuery('')}
            className={\`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors \${query === '' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}\`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setQuery(cat)}
              className={\`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors \${query.toLowerCase() === cat.toLowerCase() ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Results */}
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4">
        <p className="text-xs text-slate-500 font-medium mb-3">
          {query ? \`\${results.length} items found for "\${query}"\` : \`All Products (\${results.length})\`}
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
                className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between shadow-sm hover:shadow transition-shadow"
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
console.log("✓ Created clean, working SearchOverlay.tsx");

// =====================================================================
// 4. CLEAN PROMOTIONS TICKER
// =====================================================================
fs.writeFileSync('./src/components/PromotionsTicker.tsx', `import React from 'react';
export const PromotionsTicker: React.FC = () => (
  <div className="bg-amber-300 text-slate-900 py-1.5 px-4 text-center text-xs font-semibold tracking-wide">
    Special Offer: Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
  </div>
);
`, 'utf8');
console.log("✓ Updated PromotionsTicker.tsx");

// =====================================================================
// 5. UPDATE AdminDashboard.tsx (Camera Capture Photo Upload)
// =====================================================================
const adminPath = './src/components/admin/AdminDashboard.tsx';
let admin = fs.readFileSync(adminPath, 'utf8');

// Replace the Image URL input section with Camera upload input
const oldUrlRegex = /<div>\s*<label[^>]*>\s*Product Image URL\s*<\/label>[\s\S]*?<\/div>/i;
if (oldUrlRegex.test(admin)) {
  const cameraUploadCode = `<div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Photo (Take Photo / Upload)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
                    <span>📷 Open Camera / Snap Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const maxDim = 500;
                            let w = img.width, h = img.height;
                            if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
                            else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
                            canvas.width = w; canvas.height = h;
                            canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                            setNewProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.8) }));
                          };
                          img.src = evt.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {newProduct.image ? (
                    <div className="flex items-center gap-2">
                      <img src={newProduct.image} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                      <span className="text-xs text-emerald-600 font-semibold">✓ Photo Ready</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Tap to snap photo on phone</span>
                  )}
                </div>
              </div>`;
  admin = admin.replace(oldUrlRegex, cameraUploadCode);
  console.log("✓ Replaced Product Image URL with Camera Upload in AdminDashboard.tsx");
}

// Replace Telugu placeholder with Indian English
admin = admin.replace(/తాజా\s*టమాటాలు/g, 'Fresh Tomatoes');
fs.writeFileSync(adminPath, admin, 'utf8');

// =====================================================================
// 6. GLOBAL MOJIBAKE AND CHARACTER PURGE
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

console.log("\n🎉 Clean reset complete! Ready to build.");
