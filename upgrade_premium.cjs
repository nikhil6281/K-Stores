const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// 1. index.html — Add Google Fonts
// ─────────────────────────────────────────────────────────────
let html = fs.readFileSync('./index.html', 'utf8');
if (!html.includes('Playfair+Display')) {
  html = html.replace('</head>', `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>`);
  fs.writeFileSync('./index.html', html, 'utf8');
  console.log('DONE: index.html fonts added');
}

// ─────────────────────────────────────────────────────────────
// 2. tailwind.config.js — Navy + Gold + Fonts
// ─────────────────────────────────────────────────────────────
fs.writeFileSync('./tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040814', 900: '#070C1A', 800: '#0B132B',
          700: '#1C2541', 600: '#2A3B66', 500: '#3A5080',
        },
        gold: {
          300: '#FDE68A', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body:  ['Lora', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`, 'utf8');
console.log('DONE: tailwind.config.js updated');

// ─────────────────────────────────────────────────────────────
// 3. src/index.css — Premium global styles
// ─────────────────────────────────────────────────────────────
fs.writeFileSync('./src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; scroll-behavior: smooth; }
  h1,h2,h3,h4,h5,h6,.font-heading { font-family: 'Playfair Display', Georgia, serif; }
  body { @apply bg-navy-950 text-white; }
}

.gold-text {
  background: linear-gradient(135deg,#FDE68A 0%,#F59E0B 50%,#D97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gold-btn {
  background: linear-gradient(135deg,#F59E0B 0%,#D97706 100%);
  color: #070C1A;
  font-weight: 700;
  box-shadow: 0 4px 18px rgba(217,119,6,0.4);
  transition: all 0.2s ease;
}
.gold-btn:hover {
  background: linear-gradient(135deg,#FBBF24 0%,#F59E0B 100%);
  box-shadow: 0 6px 24px rgba(245,158,11,0.55);
  transform: translateY(-1px);
}

.glass {
  background: rgba(11,19,43,0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(245,158,11,0.15);
}
`, 'utf8');
console.log('DONE: src/index.css updated');

// ─────────────────────────────────────────────────────────────
// 4. ThemeContext.tsx — Dark/Light Toggle
// ─────────────────────────────────────────────────────────────
const ctxDir = './src/context';
if (!fs.existsSync(ctxDir)) fs.mkdirSync(ctxDir, { recursive: true });
fs.writeFileSync('./src/context/ThemeContext.tsx', `import React, { createContext, useContext, useEffect, useState } from 'react';
type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggleTheme: () => {} });
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ra_theme') as Theme) || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ra_theme', theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(p => p === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
`, 'utf8');
console.log('DONE: ThemeContext.tsx created');

// ─────────────────────────────────────────────────────────────
// 5. HeroBanner.tsx — Full-width premium atmospheric hero
// ─────────────────────────────────────────────────────────────
fs.writeFileSync('./src/components/HeroBanner.tsx', `import React from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="relative w-full overflow-hidden bg-navy-950 text-white" style={{minHeight:'72vh', display:'flex', alignItems:'center'}}>
      {/* Ambient hero image */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage:"url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')", opacity:0.18 }} />
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#040814 0%,rgba(7,12,26,0.92) 60%,rgba(11,19,43,0.7) 100%)'}} />
      {/* Glow orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(245,158,11,0.08)',transform:'translate(-30%,-30%)'}} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(217,119,6,0.07)',transform:'translate(30%,30%)'}} />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-8"
          style={{background:'rgba(245,158,11,0.08)',backdropFilter:'blur(8px)'}}>
          <Sparkles className="w-4 h-4 text-amber-400" style={{animation:'pulse 2s infinite'}} />
          RA General Store — Bommalatapalli Village
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-5" style={{lineHeight:1.15, letterSpacing:'-0.01em'}}>
          Fresh Groceries,<br />
          <span className="gold-text">Delivered in 20 Minutes</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-xl max-w-2xl leading-relaxed mb-10" style={{fontFamily:'Lora,serif'}}>
          Premium pantry staples, dairy, farm-fresh vegetables and household essentials — right beside Chennampalli road, Bommalatapalli.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-10 text-xs sm:text-sm">
          {[
            { icon: <Clock className="w-4 h-4 text-amber-400" />, text: '20-Min Express Delivery' },
            { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: '100% Quality Assured' },
            { icon: <span className="text-amber-400 font-bold text-base">₹</span>, text: 'Cash on Delivery & UPI' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-600/60 text-slate-200" style={{background:'rgba(11,19,43,0.7)',backdropFilter:'blur(8px)'}}>
              {f.icon}<span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button onClick={scrollToProducts}
            className="gold-btn flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base tracking-wide">
            Explore Store Catalog <ArrowRight className="w-4 h-4" />
          </button>
          <a href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-amber-500/30 text-slate-200 hover:text-white hover:border-amber-400 transition-colors text-base font-semibold"
            style={{background:'rgba(11,19,43,0.6)',backdropFilter:'blur(8px)'}}>
            <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Quick Order
          </a>
        </div>
      </div>
    </div>
  );
};
`, 'utf8');
console.log('DONE: HeroBanner.tsx upgraded');

// ─────────────────────────────────────────────────────────────
// 6. SearchOverlay.tsx — Fully working real-time search
// ─────────────────────────────────────────────────────────────
fs.writeFileSync('./src/components/SearchOverlay.tsx', `import React, { useState, useEffect, useRef } from 'react';
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
        <p className="text-xs text-slate-500 mb-4">{query ? \`\${results.length} results for "\${query}"\` : \`Showing all \${results.length} products\`}</p>
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
`, 'utf8');
console.log('DONE: SearchOverlay.tsx - real-time search working');

// ─────────────────────────────────────────────────────────────
// 7. OfferBanner.tsx — Clean Indian English, no mojibake
// ─────────────────────────────────────────────────────────────
fs.writeFileSync('./src/components/PromotionsTicker.tsx', `import React from 'react';
import { Sparkles } from 'lucide-react';
export const PromotionsTicker: React.FC = () => (
  <div className="w-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 text-navy-900"
    style={{background:'linear-gradient(90deg,#F59E0B,#FBBF24,#F59E0B)'}}>
    <Sparkles className="w-4 h-4 shrink-0" />
    <span><strong>Special Offer:</strong> Free Village Delivery on orders above &#8377;199! Fresh farm vegetables just arrived.</span>
  </div>
);
`, 'utf8');
console.log('DONE: PromotionsTicker.tsx cleaned');

// ─────────────────────────────────────────────────────────────
// 8. Global mojibake cleanup in ALL src files
// ─────────────────────────────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules','dist','.git'].includes(e.name)) walk(full).forEach(f => out.push(f));
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) out.push(full);
  }
  return out;
}
let cleaned = 0;
for (const f of walk('./src')) {
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;
  c = c.replace(/â‚¹|â,¹/g, '\u20B9');
  c = c.replace(/â€¢|â•/g, '\u2022');
  c = c.replace(/Å½%\u2030|Å½\u2030|Å½%/g, '\u2728');
  c = c.replace(/\u00c5\u00bd%\u2030|\u00c5\u00bd\u2030/g, '\u2728');
  c = c.replace(/\u00c5\u00bd/g, '');
  c = c.replace(/\u00c3\u0192/g, '');
  c = c.replace(/\u00e2\u0080\u009c|\u00e2\u0080\u009d/g, '"');
  if (c !== orig) { fs.writeFileSync(f, c, 'utf8'); cleaned++; }
}
console.log('DONE: Cleaned ' + cleaned + ' files of mojibake');

console.log('\n✅ ALL UPGRADES COMPLETE. Now run: npm run build');