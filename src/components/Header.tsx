import React from 'react';
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
              Anantapur · 20 min delivery
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
