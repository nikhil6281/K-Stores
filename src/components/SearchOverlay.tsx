import React, { useState, useEffect, useRef } from 'react';
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
            {q?`${results.length} results for "${q}"`:`Showing all ${results.length} products`}
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
