import React, { useState } from 'react';
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
