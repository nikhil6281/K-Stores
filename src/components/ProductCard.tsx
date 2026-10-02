import React, { useState } from 'react';
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
