const fs = require('fs');
const path = require('path');

// 1. RESET index.css - Clean, no fancy fonts, just works
fs.writeFileSync('./src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; scroll-behavior: smooth; }
body { background: #ffffff; color: #111827; }
`, 'utf8');
console.log('1. index.css reset to clean');

// 2. RESET tailwind.config.js - Simple and correct
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
console.log('2. tailwind.config.js reset');

// 3. RESET index.html - Remove broken font links
let html = fs.readFileSync('./index.html', 'utf8');
html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>/gi, '');
html = html.replace(/<link[^>]*fonts\.gstatic[^>]*>/gi, '');
html = html.replace(/<link[^>]*preconnect[^>]*>/gi, '');
html = html.replace(/<title>.*?<\/title>/, '<title>RA General Store - Fresh Groceries</title>');
fs.writeFileSync('./index.html', html, 'utf8');
console.log('3. index.html cleaned');

// 4. CLEAN HeroBanner.tsx - Simple clean green banner
fs.writeFileSync('./src/components/HeroBanner.tsx', `import React from 'react';
import { Clock, ShieldCheck, Truck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div>
      {/* Main Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
        color: 'white',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', lineHeight: 1.2 }}>
            RA General Store
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '8px' }}>
            Fresh Groceries • 20-Min Village Delivery
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>
            on main road, Bommalatapalli beside Chennampalli road
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '4px' }}>
            Open Everyday: 5:00 AM to 8:30 PM
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <Clock size={15} /> 20-Min Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <ShieldCheck size={15} /> Quality Assured
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <Truck size={15} /> Free Village Delivery
            </div>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div style={{ background: '#fef08a', color: '#713f12', textAlign: 'center', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
        Free Delivery on orders above &#8377;199 • Fresh vegetables just arrived!
      </div>
    </div>
  );
};
`, 'utf8');
console.log('4. HeroBanner.tsx - clean green hero');

// 5. FIX SearchOverlay.tsx - Working search
fs.writeFileSync('./src/components/SearchOverlay.tsx', `import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
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

  const categories = ['Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils', 'Pulses'];

  const results = (products || []).filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (p.nameEn || '').toLowerCase().includes(q) ||
           (p.category || '').toLowerCase().includes(q);
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search vegetables, dairy, rice, snacks..."
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px', border: '2px solid #16a34a', borderRadius: '10px', fontSize: '15px', outline: 'none' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button onClick={onClose} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#374151' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button onClick={() => setQuery('')} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid #16a34a', background: query === '' ? '#16a34a' : 'white', color: query === '' ? 'white' : '#16a34a', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setQuery(cat)} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid #d1d5db', background: query.toLowerCase() === cat.toLowerCase() ? '#16a34a' : 'white', color: query.toLowerCase() === cat.toLowerCase() ? 'white' : '#374151', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
            {query ? \`\${results.length} results for "\${query}"\` : \`\${results.length} products available\`}
          </p>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>No products found</p>
              <p style={{ fontSize: '13px' }}>Try "Tomato", "Milk" or "Rice"</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {results.map(product => (
                <div key={product.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <img src={product.image} alt={product.nameEn} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameEn}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{product.category}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '15px' }}>&#8377;{product.price}</span>
                      <button
                        onClick={() => handleAdd(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: 'none', background: added[product.id] ? '#dcfce7' : '#16a34a', color: added[product.id] ? '#15803d' : 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        {added[product.id] ? <Check size={13} /> : <Plus size={13} />}
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
    </div>
  );
};
`, 'utf8');
console.log('5. SearchOverlay.tsx - clean working search');

// 6. FIX PromotionsTicker.tsx
fs.writeFileSync('./src/components/PromotionsTicker.tsx', `import React from 'react';
export const PromotionsTicker: React.FC = () => (
  <div style={{ background: '#fef08a', color: '#713f12', textAlign: 'center', padding: '8px 16px', fontSize: '13px', fontWeight: 600 }}>
    Special Offer: Free Village Delivery on orders above &#8377;199! Fresh farm vegetables just arrived.
  </div>
);
`, 'utf8');
console.log('6. PromotionsTicker.tsx fixed');

// 7. CLEAN ThemeContext (remove it - keep things simple)
const ctxDir = './src/context';
if (!fs.existsSync(ctxDir)) fs.mkdirSync(ctxDir, { recursive: true });
const themeFile = './src/context/ThemeContext.tsx';
if (fs.existsSync(themeFile)) fs.unlinkSync(themeFile);
console.log('7. ThemeContext removed (keeping it simple)');

// 8. FIX Admin Dashboard camera capture
const adminPath = './src/components/admin/AdminDashboard.tsx';
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, 'utf8');

  // Add handleImageCapture if missing
  if (!admin.includes('handleImageCapture')) {
    const fn = `
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 600;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h > max) { w = Math.round(w * max / h); h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setNewProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.85) }));
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };`;
    admin = admin.replace(
      /const\s+\[newProduct/,
      `${fn}\n\n  const [newProduct`
    );
  }

  // Replace URL input with camera button
  if (admin.includes('Product Image URL')) {
    admin = admin.replace(
      /<div[^>]*>[\s\S]*?Product Image URL[\s\S]*?<\/div>\s*<\/div>/,
      `<div style={{gridColumn:'1/-1'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:600,marginBottom:'8px',color:'#374151'}}>Product Photo</label>
              {newProduct.image ? (
                <div style={{position:'relative',borderRadius:'12px',overflow:'hidden',border:'2px solid #16a34a',height:'160px'}}>
                  <img src={newProduct.image} alt="Preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  <label htmlFor="cam-input" style={{position:'absolute',bottom:'8px',right:'8px',background:'#16a34a',color:'white',padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Change Photo</label>
                </div>
              ) : (
                <label htmlFor="cam-input" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',border:'2px dashed #16a34a',borderRadius:'12px',padding:'32px',cursor:'pointer',background:'#f0fdf4'}}>
                  <span style={{fontSize:'2rem'}}>📷</span>
                  <span style={{fontWeight:700,color:'#166534',fontSize:'14px'}}>Click to Open Camera</span>
                  <span style={{fontSize:'12px',color:'#6b7280'}}>Or select from gallery</span>
                </label>
              )}
              <input id="cam-input" type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{display:'none'}} />
            </div>`
    );
  }

  fs.writeFileSync(adminPath, admin, 'utf8');
  console.log('8. Admin camera capture fixed');
}

// 9. GLOBAL mojibake cleanup
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules','dist','.git'].includes(e.name)) walk(full).forEach(f => out.push(f));
    else if (/\.(tsx|ts|js)$/.test(e.name)) out.push(full);
  }
  return out;
}
let cleaned = 0;
for (const f of walk('./src')) {
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;
  c = c.replace(/â‚¹|â,¹/g, '₹');
  c = c.replace(/â€¢|â•/g, '•');
  c = c.replace(/Ž%‰|Ž‰|Ž%|Å½%\u2030|Å½\u2030/g, '✨');
  if (c !== orig) { fs.writeFileSync(f, c, 'utf8'); cleaned++; }
}
console.log('9. Cleaned ' + cleaned + ' files of broken symbols');

// 10. Remove ThemeProvider from App.tsx if added
const appPath = './src/App.tsx';
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  app = app.replace(/import\s+\{\s*ThemeProvider\s*\}[^\n]+\n/, '');
  app = app.replace(/<ThemeProvider>\s*/g, '');
  app = app.replace(/\s*<\/ThemeProvider>/g, '');
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('10. Removed ThemeProvider from App.tsx');
}

console.log('\n✅ DONE. Now run: npm run build');