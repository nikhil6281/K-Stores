import React, { useState, useEffect, useRef } from 'react';
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
