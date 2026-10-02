import React from 'react';
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
