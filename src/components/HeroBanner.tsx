import React from 'react';
import { Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => (
  <div>
    {/* Yellow top strip — Blinkit style */}
    <div style={{
      background: 'linear-gradient(135deg, #F8C200 0%, #f5a623 100%)',
      padding: '28px 20px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle circles like Blinkit */}
      <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'rgba(255,255,255,0.12)'}}/>
      <div style={{position:'absolute',bottom:'-60px',left:'30%',width:'240px',height:'240px',borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>

      <div style={{maxWidth:'600px',margin:'0 auto',position:'relative',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.12)',borderRadius:'999px',padding:'5px 16px',fontSize:'12px',fontWeight:700,marginBottom:'14px',color:'#1a1a1a'}}>
          <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#0C831F',display:'inline-block'}}/>
          Delivery in 20 minutes • Bommalatapalli
        </div>

        <h1 style={{fontSize:'clamp(1.5rem,5vw,2.4rem)',fontWeight:800,color:'#1a1a1a',margin:'0 0 8px',lineHeight:1.2}}>
          RA General Store
        </h1>
        <p style={{fontSize:'clamp(0.85rem,2.5vw,1rem)',color:'rgba(0,0,0,0.65)',margin:'0 0 20px',fontWeight:500}}>
          Daily Fresh Groceries, Vegetables &amp; Essentials
        </p>

        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px'}}>
          <button
            onClick={() => document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })}
            style={{background:'#0C831F',color:'#fff',border:'none',padding:'13px 28px',borderRadius:'10px',fontWeight:700,fontSize:'14px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 12px rgba(12,131,31,0.3)'}}>
            Browse Groceries
          </button>
          <a
            href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order"
            target="_blank" rel="noopener noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.12)',border:'none',color:'#1a1a1a',padding:'13px 22px',borderRadius:'10px',fontWeight:700,fontSize:'14px',textDecoration:'none',fontFamily:'inherit'}}>
            <Phone size={15}/> WhatsApp Order
          </a>
        </div>
      </div>
    </div>

    {/* White card floating over yellow — Blinkit address bar style */}
    <div style={{maxWidth:'640px',margin:'-36px auto 0',padding:'0 16px',position:'relative',zIndex:2}}>
      <div style={{background:'#fff',borderRadius:'16px',boxShadow:'0 4px 24px rgba(0,0,0,0.12)',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
        <div>
          <p style={{margin:0,fontSize:'12px',color:'#666',fontWeight:500}}>Delivering to</p>
          <p style={{margin:0,fontSize:'14px',fontWeight:700,color:'#1a1a1a'}}>📍 Bommalatapalli, beside Chennampalli road</p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{margin:0,fontSize:'11px',color:'#0C831F',fontWeight:700}}>Open Now</p>
          <p style={{margin:0,fontSize:'11px',color:'#888'}}>5:00 AM – 8:30 PM</p>
        </div>
      </div>
    </div>

    {/* Offer strip */}
    <div style={{background:'#fff8e7',borderTop:'1px solid #ffe4a0',textAlign:'center',padding:'10px 16px',marginTop:'14px',fontSize:'13px',fontWeight:600,color:'#92400e'}}>
      ✨ Free Delivery on orders above ₹199 &nbsp;•&nbsp; Fresh farm vegetables just arrived!
    </div>
  </div>
);
