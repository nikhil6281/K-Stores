import React, { useState } from 'react';
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
