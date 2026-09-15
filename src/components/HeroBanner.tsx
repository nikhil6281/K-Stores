import React from 'react';
import { Clock, ShieldCheck, Truck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div>
      {/* Main Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
        color: 'white',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', lineHeight: 1.2 }}>
            RA General Store
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '8px' }}>
            Fresh Groceries • 20-Min Village Delivery
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>
            on main road, Bommalatapalli beside Chennampalli road
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '4px' }}>
            Open Everyday: 5:00 AM to 8:30 PM
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <Clock size={15} /> 20-Min Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <ShieldCheck size={15} /> Quality Assured
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' }}>
              <Truck size={15} /> Free Village Delivery
            </div>
          </div>
        </div>
      </div>

      {/* Offer Strip */}
      <div style={{ background: '#fef08a', color: '#713f12', textAlign: 'center', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
        Free Delivery on orders above &#8377;199 • Fresh vegetables just arrived!
      </div>
    </div>
  );
};
