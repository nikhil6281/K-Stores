import React, { useState } from 'react';
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
