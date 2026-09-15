const fs = require('fs');
const path = require('path');

console.log("🌟 Starting complete upgrade: Search Bar, Camera Capture & Premium Design...");

// -----------------------------------------------------------------------------
// 1. UPDATE index.html (Google Fonts: Playfair Display, Lora & Plus Jakarta Sans)
// -----------------------------------------------------------------------------
const indexPath = './index.html';
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const fontLinks = `
    <!-- Google Fonts for Luxury Kirana -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  `;
  if (!html.includes('Playfair+Display')) {
    html = html.replace('</head>', `${fontLinks}\n</head>`);
  }
  html = html.replace(/<title>.*?<\/title>/, '<title>RA General Store | Premium Village Grocery & 20-Min Delivery</title>');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log("✓ Updated index.html with luxury Google Fonts");
}

// -----------------------------------------------------------------------------
// 2. UPDATE tailwind.config.js (Navy, Gold, Playfair, Lora)
// -----------------------------------------------------------------------------
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B132B',
          50: '#F0F4FF',
          100: '#DBE4FF',
          700: '#1C2541',
          800: '#0B132B',
          900: '#070C1A',
        },
        navy: {
          950: '#040814',
          900: '#070C1A',
          800: '#0B132B',
          700: '#1C2541',
          600: '#2A3B66',
        },
        gold: {
          300: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        accent: '#D97706',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`;
fs.writeFileSync('./tailwind.config.js', tailwindConfig, 'utf8');
console.log("✓ Updated tailwind.config.js");

// -----------------------------------------------------------------------------
// 3. UPDATE src/index.css
// -----------------------------------------------------------------------------
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  h1, h2, h3, .font-heading {
    font-family: 'Playfair Display', Georgia, serif;
  }
}

.gold-gradient-text {
  background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gold-gradient-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: #070C1A;
  box-shadow: 0 4px 18px rgba(217, 119, 6, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.gold-gradient-btn:hover {
  background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.5);
  transform: translateY(-1px);
}
`;
fs.writeFileSync('./src/index.css', indexCss, 'utf8');
console.log("✓ Updated src/index.css");

// -----------------------------------------------------------------------------
// 4. CREATE ThemeContext.tsx (Dark/Light Switcher)
// -----------------------------------------------------------------------------
const themeCtxDir = './src/context';
if (!fs.existsSync(themeCtxDir)) fs.mkdirSync(themeCtxDir, { recursive: true });

const themeCtxContent = `import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ra_theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ra_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
`;
fs.writeFileSync('./src/context/ThemeContext.tsx', themeCtxContent, 'utf8');
console.log("✓ Created ThemeContext.tsx");

// -----------------------------------------------------------------------------
// 5. UPDATE OfferBanner.tsx (Pure Indian English, Zero Mojibake)
// -----------------------------------------------------------------------------
const offerPath = './src/components/OfferBanner.tsx';
const offerContent = `import React from 'react';
import { Sparkles } from 'lucide-react';

export const OfferBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-navy-950 py-2.5 px-4 text-center font-medium text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2">
      <Sparkles className="w-4 h-4 text-navy-950 shrink-0 animate-pulse" />
      <span>
        <strong className="font-bold">Special Offer:</strong> Free Village Delivery on orders above ₹199! Fresh farm vegetables just arrived.
      </span>
    </div>
  );
};
`;
fs.writeFileSync(offerPath, offerContent, 'utf8');
console.log("✓ Updated OfferBanner.tsx with clean Indian English");

// -----------------------------------------------------------------------------
// 6. UPDATE SearchOverlay.tsx (Fully Functional Real-Time Search)
// -----------------------------------------------------------------------------
const searchOverlayPath = './src/components/SearchOverlay.tsx';
const searchOverlayContent = `import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag, Plus, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SearchOverlayProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const quickFilters = ['All', 'Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils'];

  const filteredProducts = products.filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy-950/80 backdrop-blur-md">
      {/* Search Header */}
      <div className="bg-navy-900 border-b border-navy-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vegetables, dairy, rice, snacks..."
              className="w-full pl-12 pr-10 py-3.5 bg-navy-800/90 border border-amber-500/30 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm sm:text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="max-w-4xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {quickFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setQuery(filter === 'All' ? '' : filter)}
              className="px-3 py-1.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-slate-300 hover:text-amber-400 whitespace-nowrap transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {query ? `Found ${filteredProducts.length} results for "${query}"` : `Available Items (${filteredProducts.length})`}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-base">No grocery products found</p>
            <p className="text-slate-500 text-xs mt-1">Try searching with another keyword like "Tomato", "Milk", or "Rice"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-navy-900/90 border border-navy-800/80 hover:border-amber-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-navy-800 mb-2.5">
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {product.unit && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-slate-200 backdrop-blur-sm">
                        {product.unit}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1">{product.nameEn}</h4>
                  <p className="text-[11px] text-slate-400">{product.category}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-navy-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-bold text-amber-400">₹{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-[10px] text-slate-500 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(product)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    {addedIds[product.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{addedIds[product.id] ? 'Added' : 'Add'}</span>
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
`;
fs.writeFileSync(searchOverlayPath, searchOverlayContent, 'utf8');
console.log("✓ Rewrote SearchOverlay.tsx with live real-time filtering & add-to-cart");

// -----------------------------------------------------------------------------
// 7. UPDATE AdminDashboard.tsx (Camera Photo Upload + Remove URL Field)
// -----------------------------------------------------------------------------
const adminPath = './src/components/admin/AdminDashboard.tsx';
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, 'utf8');

  // Ensure Camera icon import
  if (!admin.includes('Camera')) {
    admin = admin.replace(/from\s+['"]lucide-react['"];/, ", Camera } from 'lucide-react';");
  }

  // Inject handleImageCapture logic inside component if missing
  if (!admin.includes('handleImageCapture')) {
    const handleImageCaptureCode = `
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setNewProduct(prev => ({ ...prev, image: compressedDataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
    `;
    admin = admin.replace(/const\s+AdminDashboard[^{]*{/, match => `${match}\n${handleImageCaptureCode}`);
  }

  // Replace the Image URL input block with Camera Capture Box
  const cameraInputBox = `
              {/* Camera Photo Capture */}
              <div className="col-span-full">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Product Photo (Open Camera / Snap Picture)
                </label>
                {newProduct.image ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-navy-900 group">
                    <img src={newProduct.image} alt="Preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3">
                      <label htmlFor="admin-camera-input" className="cursor-pointer px-4 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg">
                        <Camera className="w-4 h-4" /> Retake Photo
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
                        className="px-3 py-2 bg-red-600/90 hover:bg-red-700 text-white font-medium text-xs rounded-xl"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="admin-camera-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-navy-900/60 hover:bg-navy-900/90 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      📸 Open Camera / Click to Add Product Photo
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Directly opens camera on mobile or upload from files
                    </span>
                  </label>
                )}
                <input
                  id="admin-camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>
  `;

  // Replace the old Product Image URL section
  admin = admin.replace(/<div[^>]*>[\s\S]*?Product Image URL[\s\S]*?<\/div>/i, cameraInputBox);

  // Clean Telugu placeholder if user wants 100% Indian English
  admin = admin.replace(/e\.g\.\s*తాజా\s*టమాటాలు/g, 'e.g. Fresh Tomatoes');

  fs.writeFileSync(adminPath, admin, 'utf8');
  console.log("✓ Added Camera Photo Capture to AdminDashboard.tsx");
}

// -----------------------------------------------------------------------------
// 8. UPDATE Header.tsx (Search Bar click trigger & Theme Toggle)
// -----------------------------------------------------------------------------
const headerPath = './src/components/Header.tsx';
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');

  if (!header.includes('Moon')) {
    header = header.replace(/from\s+['"]lucide-react['"];/, ", Moon, Sun } from 'lucide-react';");
  }
  if (!header.includes('useTheme')) {
    header = `import { useTheme } from '../context/ThemeContext';\n` + header;
  }
  if (!header.includes('toggleTheme')) {
    header = header.replace(/const\s+Header[^{]*{/, match => `${match}\n  const { theme, toggleTheme } = useTheme();`);
  }

  // Ensure search button triggers onOpenSearch properly
  header = header.replace(/onClick=\{[^}]*onOpenSearch[^}]*\}/g, 'onClick={() => onOpenSearch && onOpenSearch()}');

  // Add Theme Switcher next to cart if not present
  if (!header.includes('aria-label="Toggle theme"')) {
    const toggleBtn = `
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-amber-400 transition-colors"
              aria-label="Toggle theme"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
            </button>
    `;
    header = header.replace(/(<button[^>]*onClick=\{onOpenCart\})/i, `${toggleBtn}\n$1`);
  }

  fs.writeFileSync(headerPath, header, 'utf8');
  console.log("✓ Updated Header.tsx with working search trigger and theme switcher");
}

// -----------------------------------------------------------------------------
// 9. UPDATE HeroBanner.tsx (Full-Width Atmosphere & Luxury Badges)
// -----------------------------------------------------------------------------
const heroPath = './src/components/HeroBanner.tsx';
const heroContent = `import React from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('products-section') || document.querySelector('.products-grid') || document.querySelector('main');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full overflow-hidden bg-navy-950 text-white">
      {/* High-Resolution Organic Grocery Visual */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')" 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-950/80" />

      {/* Decorative Warm Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>RA General Store • Bommalatapalli Village</span>
        </div>

        {/* Playfair Display Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.18]">
          Pure, Fresh Daily Groceries <br />
          <span className="gold-gradient-text">Delivered to Your Doorstep</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          Premium pantry staples, dairy, farm-fresh vegetables, and household essentials. 
          Prompt 20-minute delivery on main road, beside Chennampalli road.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-200">
          <div className="flex items-center gap-2 bg-navy-800/80 border border-navy-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>20-Min Village Express</span>
          </div>
          <div className="flex items-center gap-2 bg-navy-800/80 border border-navy-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Quality Assured</span>
          </div>
          <div className="flex items-center gap-2 bg-navy-800/80 border border-navy-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-amber-400 font-bold">₹</span>
            <span>Cash on Delivery & UPI</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={scrollToProducts}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl gold-gradient-btn font-bold text-sm sm:text-base tracking-wide"
          >
            <span>Explore Store Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store,%20I%20want%20to%20order%20groceries"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-amber-500/30 text-slate-200 hover:text-white font-semibold text-sm sm:text-base transition-colors duration-200"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Quick Order</span>
          </a>
        </div>

      </div>
    </div>
  );
};
`;
fs.writeFileSync(heroPath, heroContent, 'utf8');
console.log("✓ Updated HeroBanner.tsx with atmospheric full-width visual");

// -----------------------------------------------------------------------------
// 10. CLEAN ALL REMAINING MOJIBAKE CHARACTERS GLOBALLY
// -----------------------------------------------------------------------------
function cleanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
        cleanDirectory(full);
      }
    } else if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;

      // Currency symbol
      if (/â‚¹|â,¹|\u00e2\u201a\u00b9/g.test(content)) {
        content = content.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
        changed = true;
      }
      // Bullets
      if (content.includes('â€¢') || content.includes('â•')) {
        content = content.replace(/â€¢|â•/g, '•');
        changed = true;
      }
      // Broken emojis and artifacts
      if (/ðŸ›’|ðŸ>µ|ðŸµ|ðŸ|âš¡|“ž|Ž%‰|Ž‰|Ž%/g.test(content)) {
        content = content.replace(/ðŸ›’|ðŸ>µ|ðŸµ|ðŸ|âš¡|“ž/g, '');
        content = content.replace(/Ž%‰|Ž‰|Ž%/g, '✨');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
      }
    }
  }
}
cleanDirectory('./src');
console.log("✓ Cleaned all mojibake symbols globally across all files");

console.log("🎉 Everything upgraded successfully!");
