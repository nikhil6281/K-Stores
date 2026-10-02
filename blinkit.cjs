// blinkit.cjs — Save via Notepad → run: node blinkit.cjs
const fs = require('fs');

// ── 1. TAILWIND ────────────────────────────────────────────────
fs.writeFileSync('tailwind.config.js',
`export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`, 'utf8');

// ── 2. GLOBAL CSS ──────────────────────────────────────────────
fs.writeFileSync('src/index.css',
`@tailwind base;
@tailwind components;
@tailwind utilities;
*, *::before, *::after { box-sizing: border-box; }
html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
body { background: #f2f3f7; color: #1a1a1a; margin: 0; }
img { max-width: 100%; display: block; }
`, 'utf8');
console.log('✓ tailwind + CSS done');

// ── 3. HEROBANNER — Blinkit Style ─────────────────────────────
fs.writeFileSync('src/components/HeroBanner.tsx',
`import React from 'react';
import { Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => (
  <div>
    {/* Yellow top strip — Blinkit style */}
    <div style={{
      background: 'linear-gradient(135deg, #F8C200 0%, #f5a623 100%)',
      padding: '28px 20px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle circles like Blinkit */}
      <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'rgba(255,255,255,0.12)'}}/>
      <div style={{position:'absolute',bottom:'-60px',left:'30%',width:'240px',height:'240px',borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>

      <div style={{maxWidth:'600px',margin:'0 auto',position:'relative',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.12)',borderRadius:'999px',padding:'5px 16px',fontSize:'12px',fontWeight:700,marginBottom:'14px',color:'#1a1a1a'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#0C831F',display:'inline-block'}}/>
          Delivery in 20 minutes • Bommalatapalli
        </div>

        <h1 style={{fontSize:'clamp(1.5rem,5vw,2.4rem)',fontWeight:800,color:'#1a1a1a',margin:'0 0 8px',lineHeight:1.2}}>
          RA General Store
        </h1>
        <p style={{fontSize:'clamp(0.85rem,2.5vw,1rem)',color:'rgba(0,0,0,0.65)',margin:'0 0 20px',fontWeight:500}}>
          Daily Fresh Groceries, Vegetables &amp; Essentials
        </p>

        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px'}}>
          <button
            onClick={() => document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })}
            style={{background:'#0C831F',color:'#fff',border:'none',padding:'13px 28px',borderRadius:'10px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 12px rgba(12,131,31,0.3)'}}>
            Browse Groceries
          </button>
          <a
            href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order"
            target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.12)',border:'none',color:'#1a1a1a',padding:'13px 22px',borderRadius:'10px',fontWeight:700,fontSize:'14px',textDecoration:'none',fontFamily:'inherit'}}>
            <Phone size={15}/> WhatsApp Order
          </a>
        </div>
      </div>
    </div>

    {/* White card floating over yellow — Blinkit address bar style */}
    <div style={{maxWidth:'640px',margin:'-36px auto 0',padding:'0 16px',position:'relative',zIndex:2}}>
      <div style={{background:'#fff',borderRadius:'16px',boxShadow:'0 4px 24px rgba(0,0,0,0.12)',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
        <div>
          <p style={{margin:0,fontSize:'12px',color:'#666',fontWeight:500}}>Delivering to</p>
          <p style={{margin:0,fontSize:'14px',fontWeight:700,color:'#1a1a1a'}}>📍 Bommalatapalli, beside Chennampalli road</p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{margin:0,fontSize:'11px',color:'#0C831F',fontWeight:700}}>Open Now</p>
          <p style={{margin:0,fontSize:'11px',color:'#888'}}>5:00 AM – 8:30 PM</p>
        </div>
      </div>
    </div>

    {/* Offer strip */}
    <div style={{background:'#fff8e7',borderTop:'1px solid #ffe4a0',textAlign:'center',padding:'10px 16px',marginTop:'14px',fontSize:'13px',fontWeight:600,color:'#92400e'}}>
      ✨ Free Delivery on orders above ₹199 &nbsp;•&nbsp; Fresh farm vegetables just arrived!
    </div>
  </div>
);
`, 'utf8');
console.log('✓ HeroBanner — Blinkit style done');

// ── 4. PRODUCT CARD — Blinkit style ───────────────────────────
fs.writeFileSync('src/components/ProductCard.tsx',
`import React, { useState } from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Minus } from 'lucide-react';

interface Props { product: Product; }

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useStore();
  const [qty, setQty] = useState(0);

  const add = () => {
    addToCart(product);
    setQty(q => q + 1);
  };
  const remove = () => setQty(q => Math.max(0, q - 1));

  const disc = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      border: '1px solid #e8e8e8',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Discount Badge */}
      {disc > 0 && (
        <div style={{position:'absolute',top:'8px',left:'8px',background:'#F8C200',color:'#1a1a1a',fontSize:'9px',fontWeight:800,padding:'2px 7px',borderRadius:'5px',zIndex:1,letterSpacing:'0.03em'}}>
          {disc}% OFF
        </div>
      )}

      {/* Image — white bg, object-contain like Blinkit */}
      <div style={{width:'100%',aspectRatio:'1/1',background:'#f8f9fa',display:'flex',alignItems:'center',justifyContent:'center',padding:'12px',overflow:'hidden'}}>
        <img
          src={product.image}
          alt={product.nameEn}
          style={{width:'100%',height:'100%',objectFit:'contain'}}
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div style={{padding:'10px 12px 12px',flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          {product.unit && (
            <p style={{margin:'0 0 2px',fontSize:'11px',color:'#888',fontWeight:500}}>{product.unit}</p>
          )}
          <h3 style={{margin:'0 0 4px',fontSize:'13px',fontWeight:700,color:'#1a1a1a',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
            {product.nameEn}
          </h3>
          {product.category && (
            <p style={{margin:0,fontSize:'11px',color:'#0C831F',fontWeight:600}}>{product.category}</p>
          )}
        </div>

        {/* Price + Add button */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px'}}>
          <div>
            <p style={{margin:0,fontSize:'15px',fontWeight:800,color:'#1a1a1a'}}>₹{product.price}</p>
            {product.mrp && product.mrp > product.price && (
              <p style={{margin:0,fontSize:'11px',color:'#aaa',textDecoration:'line-through'}}>₹{product.mrp}</p>
            )}
          </div>

          {/* Blinkit-style Add/Counter button */}
          {qty === 0 ? (
            <button onClick={add} style={{
              display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',
              width:'72px',padding:'8px 0',borderRadius:'8px',
              border:'2px solid #0C831F',background:'#fff',color:'#0C831F',
              fontWeight:800,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',
              transition:'all 0.1s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='#0C831F';e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#0C831F';}}
            >
              <Plus size={14}/> Add
            </button>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:'0',border:'2px solid #0C831F',borderRadius:'8px',overflow:'hidden',width:'88px'}}>
              <button onClick={remove} style={{flex:1,padding:'7px 0',background:'#fff',border:'none',color:'#0C831F',fontWeight:800,fontSize:'16px',cursor:'pointer',fontFamily:'inherit'}}>
                <Minus size={13}/>
              </button>
              <span style={{width:'28px',textAlign:'center',fontWeight:800,fontSize:'14px',color:'#0C831F',background:'#fff'}}>{qty}</span>
              <button onClick={add} style={{flex:1,padding:'7px 0',background:'#0C831F',border:'none',color:'#fff',fontWeight:800,fontSize:'16px',cursor:'pointer',fontFamily:'inherit'}}>
                <Plus size={13}/>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GroceryProductCard = ProductCard;
`, 'utf8');
console.log('✓ ProductCard — Blinkit style done');

// ── 5. SEARCH OVERLAY — Blinkit style ─────────────────────────
fs.writeFileSync('src/components/SearchOverlay.tsx',
`import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props { onClose: () => void; }

export const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [q, setQ] = useState('');
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const cats = ['Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils', 'Pulses'];

  const results = (products || []).filter(p => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (p.nameEn || '').toLowerCase().includes(s) || (p.category || '').toLowerCase().includes(s);
  });

  const add = (p: any) => {
    addToCart(p);
    setQtys(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
  };
  const remove = (id: string) => setQtys(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',flexDirection:'column',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(4px)'}}>
      {/* Search Header */}
      <div style={{background:'#fff',padding:'12px 16px',boxShadow:'0 2px 12px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth:'680px',margin:'0 auto'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{position:'relative',flex:1}}>
              <Search size={18} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'#888'}}/>
              <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search for groceries, vegetables, dairy..."
                style={{width:'100%',paddingLeft:'43px',paddingRight:'38px',paddingTop:'12px',paddingBottom:'12px',border:'2px solid #F8C200',borderRadius:'10px',fontSize:'14px',outline:'none',fontFamily:'inherit',background:'#fffbeb'}}
              />
              {q && (
                <button onClick={() => setQ('')} style={{position:'absolute',right:'11px',top:'50%',transform:'translateY(-50%)',border:'none',background:'none',cursor:'pointer',color:'#aaa',display:'flex'}}>
                  <X size={15}/>
                </button>
              )}
            </div>
            <button onClick={onClose} style={{padding:'10px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center'}}>
              <X size={18}/>
            </button>
          </div>

          {/* Category Chips */}
          <div style={{display:'flex',gap:'8px',marginTop:'10px',overflowX:'auto',paddingBottom:'2px'}}>
            {['All', ...cats].map(cat => {
              const active = cat === 'All' ? q === '' : q.toLowerCase() === cat.toLowerCase();
              return (
                <button key={cat} onClick={() => setQ(cat === 'All' ? '' : cat)}
                  style={{padding:'5px 14px',borderRadius:'999px',border:'2px solid',borderColor:active?'#F8C200':'#e8e8e8',background:active?'#F8C200':'#fff',color:'#1a1a1a',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap',cursor:'pointer',fontFamily:'inherit',transition:'all 0.1s'}}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{flex:1,overflowY:'auto',background:'#f2f3f7'}}>
        <div style={{maxWidth:'680px',margin:'0 auto',padding:'14px 16px'}}>
          <p style={{fontSize:'12px',color:'#666',fontWeight:600,marginBottom:'12px'}}>
            {q ? \`\${results.length} results for "\${q}"\` : \`All products (\${results.length})\`}
          </p>

          {results.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'#fff',borderRadius:'16px',border:'1px solid #e8e8e8'}}>
              <p style={{fontSize:'3rem',margin:'0 0 12px'}}>🔍</p>
              <p style={{fontWeight:700,fontSize:'15px',color:'#1a1a1a',margin:'0 0 4px'}}>No items found</p>
              <p style={{fontSize:'13px',color:'#888',margin:0}}>Try "Tomato", "Milk" or "Rice"</p>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'10px'}}>
              {results.map(p => {
                const qty = qtys[p.id] || 0;
                return (
                  <div key={p.id} style={{background:'#fff',borderRadius:'12px',border:'1px solid #e8e8e8',overflow:'hidden'}}>
                    <div style={{width:'100%',aspectRatio:'1/1',background:'#f8f9fa',padding:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <img src={p.image} alt={p.nameEn} style={{width:'100%',height:'100%',objectFit:'contain'}} loading="lazy"/>
                    </div>
                    <div style={{padding:'8px 10px 10px'}}>
                      <p style={{margin:'0 0 2px',fontSize:'12px',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nameEn}</p>
                      <p style={{margin:'0 0 8px',fontSize:'11px',color:'#888'}}>{p.unit || p.category}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontWeight:800,fontSize:'14px'}}>₹{p.price}</span>
                        {qty === 0 ? (
                          <button onClick={() => add(p)}
                            style={{display:'flex',alignItems:'center',gap:'3px',padding:'6px 10px',border:'2px solid #0C831F',borderRadius:'7px',background:'#fff',color:'#0C831F',fontWeight:800,fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
                            <Plus size={12}/> Add
                          </button>
                        ) : (
                          <div style={{display:'flex',alignItems:'center',border:'2px solid #0C831F',borderRadius:'7px',overflow:'hidden'}}>
                            <button onClick={() => remove(p.id)} style={{padding:'5px 7px',background:'#fff',border:'none',color:'#0C831F',cursor:'pointer',fontWeight:800,display:'flex'}}>
                              <Minus size={11}/>
                            </button>
                            <span style={{padding:'0 6px',fontWeight:800,fontSize:'13px',color:'#0C831F'}}>{qty}</span>
                            <button onClick={() => add(p)} style={{padding:'5px 7px',background:'#0C831F',border:'none',color:'#fff',cursor:'pointer',fontWeight:800,display:'flex'}}>
                              <Plus size={11}/>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`, 'utf8');
console.log('✓ SearchOverlay — Blinkit style done');

// ── 6. PROMOTIONS TICKER ───────────────────────────────────────
fs.writeFileSync('src/components/PromotionsTicker.tsx',
`import React from 'react';
export const PromotionsTicker: React.FC = () => (
  <div style={{background:'#fff8e7',borderTop:'1px solid #ffe4a0',borderBottom:'1px solid #ffe4a0',textAlign:'center',padding:'9px 16px',fontSize:'13px',fontWeight:700,color:'#92400e'}}>
    ✨ Special Offer: Free Village Delivery on orders above ₹199 &nbsp;•&nbsp; Fresh farm vegetables just arrived!
  </div>
);
`, 'utf8');
console.log('✓ PromotionsTicker updated');

// ── 7. MOJIBAKE CLEANUP ────────────────────────────────────────
const path = require('path');
function walk(dir) {
  let r = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules','dist','.git'].includes(e.name)) r = r.concat(walk(f));
    else if (/\.(tsx|ts|js)$/.test(e.name)) r.push(f);
  }
  return r;
}
let n = 0;
for (const f of walk('./src')) {
  let c = fs.readFileSync(f, 'utf8'), o = c;
  c = c.replace(/â‚¹|â,¹/g,'₹').replace(/â€¢|â•/g,'•').replace(/Ž%‰|Ž‰|Ž%/g,'✨');
  if (c !== o) { fs.writeFileSync(f, c, 'utf8'); n++; }
}
console.log('✓ Cleaned mojibake in ' + n + ' files');

console.log('\n✅ Blinkit-style redesign complete! Run: npm run build');