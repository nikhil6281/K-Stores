import React from 'react';
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
