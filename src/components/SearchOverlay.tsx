import React, { useState, useEffect, useRef } from 'react';
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
            {q ? `${results.length} results for "${q}"` : `All products (${results.length})`}
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
