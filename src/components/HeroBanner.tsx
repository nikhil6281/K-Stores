import React from 'react';
export const HeroBanner: React.FC = () => (
  <div style={{maxWidth:'480px',margin:'0 auto',padding:'18px 16px 0'}}>
    <p style={{margin:'0 0 2px',fontSize:'13px',color:'var(--green)',fontWeight:700,display:'flex',alignItems:'center',gap:'4px'}}>
      <span style={{display:'inline-block',width:'8px',height:'8px',borderRadius:'50%',background:'var(--green)',animation:'pulse 2s infinite'}} />
      Delivery in 20 minutes
    </p>
    <h2 style={{margin:'0 0 14px',fontSize:'26px',fontWeight:800,color:'var(--text)',lineHeight:1.2,letterSpacing:'-0.5px'}}>
      Fresh picks for you
    </h2>
    <a href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order" target="_blank" rel="noopener noreferrer"
      style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'#25D366',color:'#fff',padding:'8px 16px',borderRadius:'999px',fontSize:'12px',fontWeight:700,textDecoration:'none',marginBottom:'6px',boxShadow:'0 2px 8px rgba(37,211,102,0.3)'}}>
      <span>📞</span> Quick WhatsApp Order: 62817 30144
    </a>
  </div>
);
