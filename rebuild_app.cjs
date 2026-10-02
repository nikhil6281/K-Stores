// rebuild_app.cjs — node rebuild_app.cjs
const fs = require('fs');
const path = require('path');
console.log('Building RA General Store App from scratch...\n');

// 1. TAILWIND
fs.writeFileSync('tailwind.config.js',
`export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`, 'utf8');
console.log('1. tailwind.config.js');

// 2. GLOBAL CSS
fs.writeFileSync('src/index.css',
`:root {
  --green: #0C5E2D;
  --green-hover: #0a4f25;
  --green-light: #f0faf2;
  --amber: #F8C200;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --bg: #f3f4f6;
  --card: #ffffff;
  --nav-h: 64px;
}
@import "tailwindcss";
*, *::before, *::after { box-sizing: border-box; }
html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bg);
}
body { margin: 0; padding: 0; background: var(--bg); color: var(--text); padding-bottom: var(--nav-h); }
img { max-width: 100%; display: block; }
* { -webkit-tap-highlight-color: transparent; }
button { font-family: inherit; }
`, 'utf8');
console.log('2. src/index.css');

// 3. HEADER
fs.writeFileSync('src/components/Header.tsx',
`import React from 'react';
import { Search, ShoppingCart, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
interface HeaderProps { onOpenSearch: () => void; }
export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { cart } = useStore();
  const count = cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  return (
    <header style={{position:'sticky',top:0,zIndex:40,background:'var(--green)',boxShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>
      <div style={{maxWidth:'480px',margin:'0 auto',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'1px'}}>
            <MapPin size={12} color="rgba(255,255,255,0.75)" />
            <span style={{fontSize:'11px',color:'rgba(255,255,255,0.75)',fontWeight:500}}>Bommalatapalli · 20 min</span>
          </div>
          <h1 style={{margin:0,fontSize:'18px',fontWeight:800,color:'#fff',letterSpacing:'-0.4px'}}>RA General Store</h1>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={onOpenSearch} style={{background:'rgba(255,255,255,0.18)',border:'none',borderRadius:'10px',padding:'9px',cursor:'pointer',display:'flex'}}>
            <Search size={18} color="#fff" />
          </button>
          <div style={{position:'relative'}}>
            <button style={{background:'rgba(255,255,255,0.18)',border:'none',borderRadius:'10px',padding:'9px',cursor:'pointer',display:'flex'}}>
              <ShoppingCart size={18} color="#fff" />
            </button>
            {count > 0 && (
              <span style={{position:'absolute',top:'-5px',right:'-5px',background:'var(--amber)',color:'#111',borderRadius:'999px',minWidth:'18px',height:'18px',fontSize:'10px',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                {count}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
`, 'utf8');
console.log('3. Header.tsx');

// 4. HERO BANNER
fs.writeFileSync('src/components/HeroBanner.tsx',
`import React from 'react';
export const HeroBanner: React.FC = () => (
  <div style={{maxWidth:'480px',margin:'0 auto',padding:'18px 16px 0'}}>
    <p style={{margin:'0 0 2px',fontSize:'13px',color:'var(--green)',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>
      <span style={{display:'inline-block',width:'8px',height:'8px',borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite'}} />
      Delivery in 20 minutes
    </p>
    <h2 style={{margin:'0 0 14px',fontSize:'26px',fontWeight:800,color:'var(--text)',lineHeight:1.2,letterSpacing:'-0.5px'}}>
      Fresh picks for you
    </h2>
    <a href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order" target="_blank" rel="noopener noreferrer"
      style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#25D366',color:'#fff',padding:'8px 16px',borderRadius:'999px',fontSize:'12px',fontWeight:700,textDecoration:'none',marginBottom:'6px',boxShadow:'0 2px 8px rgba(37,211,102,0.3)'}}>
      <span>📞</span> Quick WhatsApp Order: 62817 30144
    </a>
  </div>
);
`, 'utf8');
console.log('4. HeroBanner.tsx');

// 5. PROMOTIONS TICKER
fs.writeFileSync('src/components/PromotionsTicker.tsx',
`import React from 'react';
export const PromotionsTicker: React.FC = () => (
  <div style={{background:'#fffbeb',borderBottom:'1px solid #fde68a',textAlign:'center',padding:'8px 16px',fontSize:'12px',fontWeight:700,color:'#92400e'}}>
    ✨ Free Delivery on orders above ₹199 &nbsp;•&nbsp; Fresh vegetables just arrived!
  </div>
);
`, 'utf8');
console.log('5. PromotionsTicker.tsx');

// 6. PRODUCT CARD
fs.writeFileSync('src/components/ProductCard.tsx',
`import React, { useState } from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Minus } from 'lucide-react';
interface Props { product: Product; }
export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useStore();
  const [qty, setQty] = useState(0);
  const onAdd = () => { addToCart(product); setQty(q => q + 1); };
  const onRem = () => setQty(q => Math.max(0, q - 1));
  const disc = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div style={{background:'var(--card)',borderRadius:'16px',border:'1px solid var(--border)',overflow:'hidden',display:'flex',flexDirection:'column',position:'relative',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
      {disc > 0 && (
        <div style={{position:'absolute',top:'8px',left:'8px',zIndex:1,background:'var(--amber)',color:'#111',fontSize:'9px',fontWeight:800,padding:'2px 7px',borderRadius:'5px'}}>
          {disc}% OFF
        </div>
      )}
      {/* Image */}
      <div style={{width:'100%',aspectRatio:'1/1',background:'#f8f8f8',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',overflow:'hidden'}}>
        <img src={product.image} alt={product.nameEn}
          style={{width:'100%',height:'100%',objectFit:'contain'}} loading="lazy"
          onError={(e)=>{ (e.target as HTMLImageElement).src='https://placehold.co/200x200/f3f4f6/9ca3af?text=No+Image'; }} />
      </div>
      {/* Info */}
      <div style={{padding:'10px 12px 12px',flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          {product.unit && <p style={{margin:'0 0 2px',fontSize:'11px',color:'var(--muted)',fontWeight:500}}>{product.unit}</p>}
          <h3 style={{margin:'0 0 3px',fontSize:'13px',fontWeight:700,color:'var(--text)',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {product.nameEn}
          </h3>
          {product.category && <p style={{margin:0,fontSize:'11px',color:'var(--green)',fontWeight:600}}>{product.category}</p>}
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'10px'}}>
          <div>
            <p style={{margin:0,fontSize:'15px',fontWeight:800,color:'var(--text)'}}>₹{product.price}</p>
            {product.mrp && product.mrp > product.price && <p style={{margin:0,fontSize:'10px',color:'#bbb',textDecoration:'line-through'}}>₹{product.mrp}</p>}
          </div>
          {qty === 0 ? (
            <button onClick={onAdd} style={{display:'flex',alignItems:'center',gap:'4px',padding:'8px 12px',border:'2px solid var(--green)',borderRadius:'10px',background:'#fff',color:'var(--green)',fontWeight:800,fontSize:'12px',cursor:'pointer'}}>
              <Plus size={13} /> ADD
            </button>
          ) : (
            <div style={{display:'flex',alignItems:'center',border:'2px solid var(--green)',borderRadius:'10px',overflow:'hidden'}}>
              <button onClick={onRem} style={{padding:'7px 9px',background:'#fff',border:'none',color:'var(--green)',cursor:'pointer',display:'flex',alignItems:'center',fontWeight:800}}><Minus size={13} /></button>
              <span style={{padding:'0 8px',fontWeight:800,fontSize:'14px',color:'var(--green)',background:'#fff'}}>{qty}</span>
              <button onClick={onAdd} style={{padding:'7px 9px',background:'var(--green)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',fontWeight:800}}><Plus size={13} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export const GroceryProductCard = ProductCard;
`, 'utf8');
console.log('6. ProductCard.tsx');

// 7. SEARCH OVERLAY
fs.writeFileSync('src/components/SearchOverlay.tsx',
`import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
interface Props { onClose: () => void; }
export const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [qtys, setQtys] = useState<Record<string,number>>({});
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  const cats = ['All','Vegetables','Fruits','Dairy & Eggs','Rice & Atta','Snacks','Oils','Household'];
  const results = (products || []).filter(p => {
    const s = q.toLowerCase().trim();
    const cm = cat === 'All' || (p.category || '').toLowerCase().includes(cat.toLowerCase().replace(' & ',' ').split(' ')[0]);
    return cm && (!s || (p.nameEn || '').toLowerCase().includes(s) || (p.category || '').toLowerCase().includes(s));
  });
  const add = (p: any) => { addToCart(p); setQtys(prev => ({ ...prev, [p.id]: (prev[p.id]||0)+1 })); };
  const rem = (id: string) => setQtys(prev => ({ ...prev, [id]: Math.max(0,(prev[id]||0)-1) }));
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',flexDirection:'column',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)'}}>
      <div style={{background:'#fff',boxShadow:'0 4px 24px rgba(0,0,0,0.12)'}}>
        <div style={{maxWidth:'480px',margin:'0 auto',padding:'12px 16px'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{position:'relative',flex:1}}>
              <Search size={17} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'#9ca3af'}} />
              <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..."
                style={{width:'100%',paddingLeft:'40px',paddingRight:'36px',paddingTop:'12px',paddingBottom:'12px',border:'2px solid var(--green)',borderRadius:'12px',fontSize:'14px',outline:'none',fontFamily:'inherit',background:'#f0faf2'}} />
              {q && <button onClick={()=>setQ('')} style={{position:'absolute',right:'11px',top:'50%',transform:'translateY(-50%)',border:'none',background:'none',cursor:'pointer',color:'#9ca3af',display:'flex'}}><X size={15}/></button>}
            </div>
            <button onClick={onClose} style={{padding:'10px',border:'1px solid #e5e7eb',borderRadius:'10px',background:'#fff',cursor:'pointer',display:'flex',color:'#374151'}}>
              <X size={18}/>
            </button>
          </div>
          <div style={{display:'flex',gap:'8px',marginTop:'10px',overflowX:'auto',paddingBottom:'4px'}}>
            {cats.map(c => (
              <button key={c} onClick={()=>setCat(c)} style={{padding:'6px 14px',borderRadius:'999px',border:'1.5px solid',flexShrink:0,borderColor:cat===c?'var(--green)':'#e5e7eb',background:cat===c?'var(--green)':'#fff',color:cat===c?'#fff':'#374151',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',background:'#f3f4f6'}}>
        <div style={{maxWidth:'480px',margin:'0 auto',padding:'14px 16px'}}>
          <p style={{fontSize:'12px',color:'#6b7280',fontWeight:600,marginBottom:'12px'}}>
            {results.length} {q ? 'results for "'+q+'"' : cat+' products'}
          </p>
          {results.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'#fff',borderRadius:'16px',border:'1px solid #e8e8e8'}}>
              <p style={{fontSize:'2.5rem',margin:'0 0 10px'}}>🛒</p>
              <p style={{fontWeight:700,color:'#111',margin:'0 0 4px'}}>Nothing found</p>
              <p style={{fontSize:'13px',color:'#9ca3af',margin:0}}>Try "Tomato", "Milk" or "Rice"</p>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              {results.map(p => {
                const qty = qtys[p.id]||0;
                const disc = p.mrp&&p.mrp>p.price?Math.round(((p.mrp-p.price)/p.mrp)*100):0;
                return (
                  <div key={p.id} style={{background:'#fff',borderRadius:'14px',border:'1px solid #e8e8e8',overflow:'hidden',position:'relative'}}>
                    {disc>0&&<span style={{position:'absolute',top:'7px',left:'7px',zIndex:1,background:'var(--amber)',color:'#111',fontSize:'9px',fontWeight:800,padding:'2px 6px',borderRadius:'5px'}}>{disc}% OFF</span>}
                    <div style={{width:'100%',aspectRatio:'1/1',background:'#f8f8f8',padding:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <img src={p.image} alt={p.nameEn} style={{width:'100%',height:'100%',objectFit:'contain'}} loading="lazy"
                        onError={(e)=>{ (e.target as HTMLImageElement).src='https://placehold.co/200x200/f3f4f6/9ca3af?text=No+Image'; }} />
                    </div>
                    <div style={{padding:'8px 10px 10px'}}>
                      {p.unit&&<p style={{margin:'0 0 1px',fontSize:'10px',color:'#9ca3af'}}>{p.unit}</p>}
                      <p style={{margin:'0 0 3px',fontSize:'12px',fontWeight:700,lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{p.nameEn}</p>
                      <p style={{margin:'0 0 8px',fontSize:'10px',color:'var(--green)',fontWeight:600}}>{p.category}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontWeight:800,fontSize:'14px'}}>₹{p.price}</span>
                        {qty===0?(
                          <button onClick={()=>add(p)} style={{display:'flex',alignItems:'center',gap:'3px',padding:'6px 9px',border:'2px solid var(--green)',borderRadius:'8px',background:'#fff',color:'var(--green)',fontWeight:800,fontSize:'11px',cursor:'pointer',fontFamily:'inherit'}}>
                            <Plus size={11}/> ADD
                          </button>
                        ):(
                          <div style={{display:'flex',alignItems:'center',border:'2px solid var(--green)',borderRadius:'8px',overflow:'hidden'}}>
                            <button onClick={()=>rem(p.id)} style={{padding:'5px 7px',background:'#fff',border:'none',color:'var(--green)',cursor:'pointer',display:'flex',fontWeight:800}}><Minus size={11}/></button>
                            <span style={{padding:'0 5px',fontWeight:800,fontSize:'12px',color:'var(--green)'}}>{qty}</span>
                            <button onClick={()=>add(p)} style={{padding:'5px 7px',background:'var(--green)',border:'none',color:'#fff',cursor:'pointer',display:'flex',fontWeight:800}}><Plus size={11}/></button>
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
console.log('7. SearchOverlay.tsx');

// 8. BOTTOM NAV
fs.writeFileSync('src/components/BottomNav.tsx',
`import React, { useState } from 'react';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
export const BottomNav: React.FC = () => {
  const { cart } = useStore();
  const count = cart.reduce((s: number, i: any) => s + (i.quantity||1), 0);
  const [active, setActive] = useState('home');
  const tabs = [
    { id:'home', icon:Home, label:'Home' },
    { id:'search', icon:Search, label:'Search' },
    { id:'cart', icon:ShoppingCart, label:'Cart' },
    { id:'orders', icon:ClipboardList, label:'Orders' },
    { id:'account', icon:User, label:'Account' },
  ];
  return (
    <nav style={{position:'fixed',bottom:0,left:0,right:0,zIndex:40,background:'#fff',borderTop:'1px solid #e5e7eb',boxShadow:'0 -4px 16px rgba(0,0,0,0.08)'}}>
      <div style={{maxWidth:'480px',margin:'0 auto',display:'flex'}}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={()=>setActive(id)}
            style={{flex:1,padding:'10px 0 12px',border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',color:active===id?'var(--green)':'#9ca3af',fontFamily:'inherit',position:'relative'}}>
            <div style={{position:'relative'}}>
              <Icon size={22} />
              {id==='cart'&&count>0&&(
                <span style={{position:'absolute',top:'-6px',right:'-8px',background:'var(--amber)',color:'#111',borderRadius:'999px',minWidth:'16px',height:'16px',fontSize:'9px',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                  {count}
                </span>
              )}
            </div>
            <span style={{fontSize:'10px',fontWeight:active===id?700:500}}>{label}</span>
            {active===id&&<span style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'24px',height:'2.5px',borderRadius:'0 0 3px 3px',background:'var(--green)'}} />}
          </button>
        ))}
      </div>
    </nav>
  );
};
`, 'utf8');
console.log('8. BottomNav.tsx');

// 9. MOJIBAKE CLEANUP
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
console.log('9. Cleaned '+n+' files of broken symbols');
console.log('\nDone! Run: npm run build');