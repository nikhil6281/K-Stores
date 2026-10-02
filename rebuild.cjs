// rebuild.cjs  — Save via Notepad, then run: node rebuild.cjs
const fs = require('fs');

// ── TAILWIND (clean, no custom colors) ─────────────────────────
fs.writeFileSync('tailwind.config.js',
`export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`,'utf8');

// ── GLOBAL CSS (clean white site, image safety) ─────────────────
fs.writeFileSync('src/index.css',
`@tailwind base;
@tailwind components;
@tailwind utilities;
*,*::before,*::after{box-sizing:border-box}
html{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
body{background:#f8fafc;color:#0f172a;margin:0}
img{max-width:100%;height:auto;display:block;object-fit:cover}
`,'utf8');

// ── HERO BANNER ─────────────────────────────────────────────────
fs.writeFileSync('src/components/HeroBanner.tsx',
`import React from 'react';
import { Clock, ShieldCheck, Truck, Phone } from 'lucide-react';
export const HeroBanner: React.FC = () => (
  <div>
    <div style={{background:'linear-gradient(135deg,#14532d 0%,#15803d 100%)',color:'#fff',padding:'40px 20px',textAlign:'center'}}>
      <div style={{maxWidth:'640px',margin:'0 auto'}}>
        <div style={{display:'inline-block',padding:'4px 16px',borderRadius:'999px',background:'rgba(255,255,255,0.15)',fontSize:'12px',fontWeight:600,marginBottom:'16px',letterSpacing:'0.05em'}}>
          Bommalatapalli Village • Express Delivery
        </div>
        <h1 style={{fontSize:'clamp(1.6rem,5vw,2.6rem)',fontWeight:800,margin:'0 0 10px',lineHeight:1.2}}>
          RA General Store
        </h1>
        <p style={{fontSize:'clamp(0.9rem,2.5vw,1.1rem)',opacity:0.9,margin:'0 0 6px',fontWeight:500}}>
          Fresh Groceries & Vegetables — Delivered in 20 Minutes
        </p>
        <p style={{fontSize:'13px',opacity:0.75,margin:0}}>
          on main road, Bommalatapalli beside Chennampalli road &nbsp;•&nbsp; Everyday 5:00 AM – 8:30 PM
        </p>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px',marginTop:'24px'}}>
          {[{icon:'🕐',text:'20-Min Delivery'},{icon:'✅',text:'Quality Assured'},{icon:'🚚',text:'Free Village Delivery'},{icon:'₹',text:'COD & UPI'}].map((b,i)=>(
            <span key={i} style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(0,0,0,0.2)',borderRadius:'10px',padding:'7px 14px',fontSize:'12px',fontWeight:600}}>
              <span>{b.icon}</span>{b.text}
            </span>
          ))}
        </div>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'12px',marginTop:'24px'}}>
          <button
            onClick={()=>document.querySelector('main')?.scrollIntoView({behavior:'smooth'})}
            style={{background:'#fbbf24',color:'#0f172a',border:'none',padding:'12px 28px',borderRadius:'12px',fontWeight:700,fontSize:'14px',cursor:'pointer'}}>
            Browse Groceries
          </button>
          <a href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store" target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',padding:'12px 22px',borderRadius:'12px',fontWeight:600,fontSize:'14px',textDecoration:'none'}}>
            <Phone size={15} /> WhatsApp: 62817 30144
          </a>
        </div>
      </div>
    </div>
    <div style={{background:'#fef08a',color:'#713f12',textAlign:'center',padding:'10px 16px',fontWeight:700,fontSize:'13px'}}>
      Special Offer: Free Delivery on orders above ₹199 · Fresh vegetables just arrived!
    </div>
  </div>
);
`,'utf8');

// ── PRODUCT CARD (safe images) ──────────────────────────────────
fs.writeFileSync('src/components/ProductCard.tsx',
`import React, { useState } from 'react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Check } from 'lucide-react';
interface Props { product: Product; }
export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const disc = product.mrp && product.mrp > product.price ? Math.round((product.mrp - product.price)/product.mrp*100) : 0;
  const add = () => { addToCart(product); setAdded(true); setTimeout(()=>setAdded(false),1200); };
  return (
    <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',transition:'box-shadow 0.2s'}}
      onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)')}
      onMouseLeave={e=>(e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.07)')}>
      <div style={{position:'relative',width:'100%',paddingTop:'100%',overflow:'hidden',background:'#f1f5f9'}}>
        <img src={product.image} alt={product.nameEn}
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover'}} loading="lazy" />
        {disc>0&&<span style={{position:'absolute',top:'8px',left:'8px',background:'#15803d',color:'#fff',fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'6px'}}>{disc}% OFF</span>}
        {product.unit&&<span style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.55)',color:'#fff',fontSize:'10px',padding:'2px 7px',borderRadius:'5px'}}>{product.unit}</span>}
      </div>
      <div style={{padding:'12px',flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          <span style={{fontSize:'10px',fontWeight:700,color:'#15803d',textTransform:'uppercase',letterSpacing:'0.05em'}}>{product.category}</span>
          <h3 style={{margin:'4px 0 0',fontSize:'14px',fontWeight:700,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{product.nameEn}</h3>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'12px',paddingTop:'10px',borderTop:'1px solid #f1f5f9'}}>
          <div>
            <span style={{fontWeight:800,fontSize:'16px',color:'#0f172a'}}>₹{product.price}</span>
            {product.mrp&&product.mrp>product.price&&<span style={{fontSize:'12px',color:'#94a3b8',textDecoration:'line-through',marginLeft:'5px'}}>₹{product.mrp}</span>}
          </div>
          <button onClick={add} style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 13px',borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'12px',background:added?'#dcfce7':'#15803d',color:added?'#15803d':'#fff',transition:'all 0.15s'}}>
            {added?<Check size={13}/>:<Plus size={13}/>}{added?'Added':'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};
export const GroceryProductCard = ProductCard;
`,'utf8');

// ── SEARCH OVERLAY (working search) ────────────────────────────
fs.writeFileSync('src/components/SearchOverlay.tsx',
`import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Check, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
interface Props { onClose: ()=>void; }
export const SearchOverlay: React.FC<Props> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [q, setQ] = useState('');
  const [added, setAdded] = useState<Record<string,boolean>>({});
  const ref = useRef<HTMLInputElement>(null);
  useEffect(()=>{
    ref.current?.focus();
    const fn=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',fn);
    return ()=>window.removeEventListener('keydown',fn);
  },[onClose]);
  const cats=['Vegetables','Dairy','Rice','Atta','Snacks','Oils','Pulses'];
  const results=(products||[]).filter(p=>{
    const s=q.toLowerCase().trim();
    if(!s) return true;
    return (p.nameEn||'').toLowerCase().includes(s)||(p.category||'').toLowerCase().includes(s);
  });
  const add=(p:any)=>{
    addToCart(p);
    setAdded(prev=>({...prev,[p.id]:true}));
    setTimeout(()=>setAdded(prev=>({...prev,[p.id]:false})),1200);
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',flexDirection:'column',background:'rgba(15,23,42,0.55)',backdropFilter:'blur(6px)'}}>
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'16px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth:'680px',margin:'0 auto'}}>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{position:'relative',flex:1}}>
              <Search size={18} style={{position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'#64748b'}}/>
              <input ref={ref} value={q} onChange={e=>setQ(e.target.value)}
                placeholder="Search vegetables, dairy, rice, snacks..."
                style={{width:'100%',paddingLeft:'42px',paddingRight:'38px',paddingTop:'11px',paddingBottom:'11px',border:'2px solid #15803d',borderRadius:'12px',fontSize:'14px',outline:'none',fontFamily:'inherit'}}/>
              {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',border:'none',background:'none',cursor:'pointer',color:'#94a3b8'}}><X size={15}/></button>}
            </div>
            <button onClick={onClose} style={{padding:'10px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',cursor:'pointer',color:'#374151',display:'flex'}}>
              <X size={18}/>
            </button>
          </div>
          <div style={{display:'flex',gap:'8px',marginTop:'10px',overflowX:'auto',paddingBottom:'2px'}}>
            {['All',...cats].map(cat=>(
              <button key={cat} onClick={()=>setQ(cat==='All'?'':cat)}
                style={{padding:'5px 14px',borderRadius:'999px',border:'1px solid',borderColor:(cat==='All'?q==='':q.toLowerCase()===cat.toLowerCase())?'#15803d':'#e2e8f0',background:(cat==='All'?q==='':q.toLowerCase()===cat.toLowerCase())?'#15803d':'#fff',color:(cat==='All'?q==='':q.toLowerCase()===cat.toLowerCase())?'#fff':'#374151',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',cursor:'pointer',fontFamily:'inherit'}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        <div style={{maxWidth:'680px',margin:'0 auto',padding:'16px'}}>
          <p style={{fontSize:'12px',color:'#64748b',marginBottom:'12px',fontWeight:500}}>
            {q?\`\${results.length} results for "\${q}"\`:\`Showing all \${results.length} products\`}
          </p>
          {results.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px',background:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0'}}>
              <ShoppingBag size={36} style={{color:'#cbd5e1',margin:'0 auto 12px'}}/>
              <p style={{fontWeight:600,color:'#475569'}}>No items found</p>
              <p style={{fontSize:'13px',color:'#94a3b8',marginTop:'4px'}}>Try "Tomato", "Milk" or "Rice"</p>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:'12px'}}>
              {results.map(p=>(
                <div key={p.id} style={{background:'#fff',borderRadius:'14px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                  <div style={{width:'100%',paddingTop:'100%',position:'relative',background:'#f1f5f9'}}>
                    <img src={p.image} alt={p.nameEn} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
                  </div>
                  <div style={{padding:'10px'}}>
                    <p style={{fontWeight:700,fontSize:'13px',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nameEn}</p>
                    <p style={{fontSize:'11px',color:'#64748b',margin:'0 0 8px'}}>{p.category}</p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontWeight:800,color:'#15803d',fontSize:'15px'}}>₹{p.price}</span>
                      <button onClick={()=>add(p)} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',border:'none',background:added[p.id]?'#dcfce7':'#15803d',color:added[p.id]?'#15803d':'#fff',fontWeight:700,fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
                        {added[p.id]?<Check size={12}/>:<Plus size={12}/>}{added[p.id]?'Added':'Add'}
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
`,'utf8');

// ── MOJIBAKE CLEANUP ────────────────────────────────────────────
const path=require('path');
function walk(dir){
  let r=[];
  for(const e of require('fs').readdirSync(dir,{withFileTypes:true})){
    const f=path.join(dir,e.name);
    if(e.isDirectory()&&!['node_modules','dist','.git'].includes(e.name)) r=r.concat(walk(f));
    else if(/\.(tsx|ts|js)$/.test(e.name)) r.push(f);
  }
  return r;
}
let n=0;
for(const f of walk('./src')){
  let c=fs.readFileSync(f,'utf8'),o=c;
  c=c.replace(/â‚¹|â,¹/g,'₹').replace(/â€¢|â•/g,'•').replace(/Ž%‰|Ž‰|Ž%/g,'✨').replace(/ðŸ›'|ðŸ>µ|ðŸµ|ðŸ|âš¡|"ž/g,'');
  if(c!==o){fs.writeFileSync(f,c,'utf8');n++;}
}

console.log('✅ Done! Files fixed: tailwind, index.css, HeroBanner, ProductCard, SearchOverlay');
console.log('✅ Cleaned mojibake in '+n+' files');
console.log('👉 Now run: npm run build');