const fs = require('fs');
const path = require('path');

console.log('🌟 Transforming RA General Store into a Premium Luxury Experience...');

// -------------------------------------------------------------
// 1. UPDATE index.html (Google Fonts: Playfair Display & Plus Jakarta Sans)
// -------------------------------------------------------------
const indexPath = './index.html';
if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  const fontLinks = `
    <!-- Google Fonts for Luxury Kirana -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;0,600;1,400&display=swap" rel="stylesheet">
  `;
  if (!indexHtml.includes('Playfair+Display')) {
    indexHtml = indexHtml.replace('</head>', `${fontLinks}\n</head>`);
  }
  indexHtml = indexHtml.replace(/<title>.*?<\/title>/, '<title>RA General Store | Premium Village Grocery & 20-Min Delivery</title>');
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('✓ Updated index.html with luxury Google Fonts');
}

// -------------------------------------------------------------
// 2. UPDATE tailwind.config.js (Navy, Champagne Gold, Playfair)
// -------------------------------------------------------------
const tailwindPath = './tailwind.config.js';
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
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        lora: ['"Lora"', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 158, 11, 0.25)',
        'card-luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
`;
fs.writeFileSync(tailwindPath, tailwindConfig, 'utf8');
console.log('✓ Updated tailwind.config.js with deep navy & champagne gold palette');

// -------------------------------------------------------------
// 3. UPDATE src/index.css (Base typography & luxury styling)
// -------------------------------------------------------------
const indexCssPath = './src/index.css';
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

/* Custom Luxury Kirana Utilities */
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

.glass-panel {
  background: rgba(11, 19, 43, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.glass-panel-light {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
`;
fs.writeFileSync(indexCssPath, indexCss, 'utf8');
console.log('✓ Configured src/index.css with luxury styling');

// -------------------------------------------------------------
// 4. CREATE src/context/ThemeContext.tsx (Light/Dark Toggle)
// -------------------------------------------------------------
const themeCtxPath = './src/context/ThemeContext.tsx';
const themeCtxDir = path.dirname(themeCtxPath);
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
fs.writeFileSync(themeCtxPath, themeCtxContent, 'utf8');
console.log('✓ Created src/context/ThemeContext.tsx');

// -------------------------------------------------------------
// 5. UPDATE src/App.tsx (Wrap with ThemeProvider & Premium Base)
// -------------------------------------------------------------
const appPath = './src/App.tsx';
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  if (!app.includes('ThemeProvider')) {
    app = `import { ThemeProvider } from './context/ThemeContext';\n` + app;
    app = app.replace(/return\s*\(\s*<Router>/, 'return (\n    <ThemeProvider>\n      <Router>');
    app = app.replace(/<\/Router>\s*\);/, '</Router>\n    </ThemeProvider>\n  );');
  }
  // Replace base styling to support dark and light mode seamlessly
  app = app.replace(/className="min-h-screen bg-slate-50"/g, 'className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"');
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('✓ Wrapped App.tsx with ThemeProvider');
}

// -------------------------------------------------------------
// 6. UPDATE src/components/HeroBanner.tsx (Atmospheric Full-Width Hero)
// -------------------------------------------------------------
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
      {/* Background with Ambient Warm Grocery Imagery */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')" 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-950/80" />

      {/* Decorative Gold Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>RA General Store • Bommalatapalli Village</span>
        </div>

        {/* Serif Headings */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.15]">
          Pure, Fresh Daily Groceries <br />
          <span className="gold-gradient-text">Delivered to Your Doorstep</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          Premium pantry staples, dairy, farm-fresh vegetables, and household essentials. 
          Prompt 20-minute delivery right beside Chennampalli road.
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
console.log('✓ Re-engineered HeroBanner.tsx with premium full-width atmosphere');

// -------------------------------------------------------------
// 7. UPDATE src/components/Footer.tsx (Luxury Midnight Footer)
// -------------------------------------------------------------
const footerPath = './src/components/Footer.tsx';
const footerContent = `import React from 'react';
import { MapPin, Clock, Phone, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800/80 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-navy-800/60">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
              RA <span className="gold-gradient-text">General Store</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your village's trusted neighborhood kirana. Providing hand-picked quality groceries, fresh dairy, and daily staples with friendly 20-minute delivery.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% Genuine Products • Fair Village Pricing</span>
            </div>
          </div>

          {/* Location & Timings */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 font-sans">
              Store Timings & Address
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>on main road , Bommalatapalli beside chennampalli road</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Everyday: 5:00 AM to 8:30 PM</span>
              </div>
            </div>
          </div>

          {/* Direct Support & Orders */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 font-sans">
              Direct Contact & Support
            </h4>
            <p className="text-sm text-slate-400">
              Need custom items or fast delivery updates? Call or WhatsApp the store owner directly:
            </p>
            <a
              href="tel:+916281730144"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-medium text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 62817 30144</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RA General Store. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with care for Bommalatapalli</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
`;
fs.writeFileSync(footerPath, footerContent, 'utf8');
console.log('✓ Redesigned Footer.tsx');

// -------------------------------------------------------------
// 8. UPDATE Header.tsx (Theme Toggle + Luxury Styling)
// -------------------------------------------------------------
const headerPath = './src/components/Header.tsx';
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');

  // Ensure Moon & Sun icons
  if (!header.includes('Moon')) {
    header = header.replace(/from\s+['"]lucide-react['"];/, ", Moon, Sun } from 'lucide-react';");
  }
  // Ensure useTheme import
  if (!header.includes('useTheme')) {
    header = `import { useTheme } from '../context/ThemeContext';\n` + header;
  }

  // Inject useTheme hook call
  if (!header.includes('toggleTheme')) {
    header = header.replace(/const\s+Header[^{]*{/, match => `${match}\n  const { theme, toggleTheme } = useTheme();`);
  }

  // Inject Theme Toggle Button next to cart or search
  if (!header.includes('aria-label="Toggle theme"')) {
    const toggleBtnHtml = `
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-amber-400 transition-colors"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
            </button>
    `;
    // Place right before cart button
    header = header.replace(/(<button[^>]*onClick=\{onOpenCart\})/i, `${toggleBtnHtml}\n$1`);
  }

  // Give header luxury dark glass effect
  header = header.replace(/bg-white[^\s"]*/g, 'bg-navy-950/90 text-white backdrop-blur-md border-b border-navy-800/80');

  fs.writeFileSync(headerPath, header, 'utf8');
  console.log('✓ Injected Dark/Light mode switcher and luxury theme into Header.tsx');
}

// -------------------------------------------------------------
// 9. CLEAN ALL MOJIBAKE AND BROKEN CHARACTERS GLOBALLY
// -------------------------------------------------------------
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

      // Mojibake rupee cleanup
      if (/â‚¹|â,¹|\u00e2\u201a\u00b9/g.test(content)) {
        content = content.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
        changed = true;
      }
      // Bullets
      if (content.includes('â€¢') || content.includes('â•')) {
        content = content.replace(/â€¢|â•/g, '•');
        changed = true;
      }
      // Weird broken emojis
      if (/ðŸ›’|ðŸ>µ|ðŸµ|ðŸ|âš¡|“ž|Ž‰|Ž%/g.test(content)) {
        content = content.replace(/ðŸ›’|ðŸ>µ|ðŸµ|ðŸ|âš¡|“ž/g, '');
        content = content.replace(/Ž‰|Ž%/g, '✨');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
      }
    }
  }
}
cleanDirectory('./src');
console.log('✓ Deep cleaned all broken symbols and mojibake from all components');

console.log('✨ Premium Makeover successfully applied!');
