// fix.cjs
const fs = require('fs');

// 1. REMOVE DARK FOOTER — replace with tiny clean strip
fs.writeFileSync('./src/components/Footer.tsx',
`import React from 'react';
export const Footer: React.FC = () => (
  <div style={{textAlign:'center',padding:'14px 16px 80px',fontSize:'11px',color:'#9ca3af',borderTop:'1px solid #e5e7eb',background:'#fff'}}>
    © 2026 RA General Store, Bommalatapalli · All rights reserved
  </div>
);
`, 'utf8');
console.log('1. Footer removed');

// 2. HIDE FAQ SECTION COMPLETELY
const faqPath = './src/components/FAQSection.tsx';
if (fs.existsSync(faqPath)) {
  fs.writeFileSync(faqPath, `import React from 'react';\nexport const FAQSection: React.FC = () => null;\n`, 'utf8');
  console.log('2. FAQSection hidden');
} else { console.log('2. FAQSection not found - skipped'); }

// 3. FIX HEADER — discreet Owner button, working search + cart
// Header will fire a custom DOM event for cart — works without touching App.tsx
fs.writeFileSync('./src/components/Header.tsx',
`import React from 'react';
import { Search, ShoppingCart, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch = () => {},
  onOpenCart,
}) => {
  const { cart } = useStore();
  const count = cart.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

  const handleCart = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      // fire a custom event App.tsx can listen to
      window.dispatchEvent(new CustomEvent('open-cart'));
    }
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: '#0C5E2D',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        maxWidth: '480px', margin: '0 auto',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Store name + location */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '1px' }}>
            <MapPin size={11} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Bommalatapalli · 20 min delivery
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            RA General Store
          </h1>
        </div>

        {/* Buttons row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onOpenSearch}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Search size={18} color="#fff" />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={handleCart}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ShoppingCart size={18} color="#fff" />
            </button>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: '#F8C200', color: '#111',
                borderRadius: '999px', minWidth: '17px', height: '17px',
                fontSize: '9px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
              }}>{count}</span>
            )}
          </div>

          {/* Owner Portal — tiny, discreet, top-right */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-admin'))}
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '7px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.55)',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            Owner
          </button>
        </div>
      </div>
    </header>
  );
};
`, 'utf8');
console.log('3. Header fixed — Owner button discreet top-right, cart fires event');

// 4. PATCH App.tsx to listen to open-cart event and open-admin event
const appPath = './src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

// Add cart event listener — inject after first useEffect or before return
if (!app.includes('open-cart')) {
  const eventCode = `
  // Listen for header cart/admin button events
  React.useEffect(() => {
    const openCart = () => setIsCartOpen(true);
    const openAdmin = () => setShowAdmin(true);
    window.addEventListener('open-cart', openCart);
    window.addEventListener('open-admin', openAdmin);
    return () => {
      window.removeEventListener('open-cart', openCart);
      window.removeEventListener('open-admin', openAdmin);
    };
  }, []);
`;
  // inject before the return statement
  app = app.replace(/(\n\s*return\s*\()/, eventCode + '$1');
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('4. App.tsx patched with cart + admin event listeners');
} else {
  console.log('4. App.tsx already has event listeners');
}

// 5. REMOVE CUSTOMER SUPPORT MODAL if it is cluttering the UI
const csPath = './src/components/CustomerSupportModal.tsx';
if (fs.existsSync(csPath)) {
  let cs = fs.readFileSync(csPath, 'utf8');
  if (cs.length > 50) {
    console.log('5. CustomerSupportModal exists — leaving as is');
  }
}

console.log('\nDone! Now run: npm run build');