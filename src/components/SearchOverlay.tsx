import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SearchOverlayProps { onClose: () => void; }

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categories = ['Vegetables', 'Dairy', 'Rice', 'Atta', 'Snacks', 'Oils', 'Pulses'];

  const results = (products || []).filter(p => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (p.nameEn || '').toLowerCase().includes(q) ||
           (p.category || '').toLowerCase().includes(q);
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search vegetables, dairy, rice, snacks..."
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px', border: '2px solid #16a34a', borderRadius: '10px', fontSize: '15px', outline: 'none' }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button onClick={onClose} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#374151' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button onClick={() => setQuery('')} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid #16a34a', background: query === '' ? '#16a34a' : 'white', color: query === '' ? 'white' : '#16a34a', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setQuery(cat)} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid #d1d5db', background: query.toLowerCase() === cat.toLowerCase() ? '#16a34a' : 'white', color: query.toLowerCase() === cat.toLowerCase() ? 'white' : '#374151', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
            {query ? `${results.length} results for "${query}"` : `${results.length} products available`}
          </p>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>No products found</p>
              <p style={{ fontSize: '13px' }}>Try "Tomato", "Milk" or "Rice"</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {results.map(product => (
                <div key={product.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <img src={product.image} alt={product.nameEn} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameEn}</p>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>{product.category}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '15px' }}>&#8377;{product.price}</span>
                      <button
                        onClick={() => handleAdd(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: 'none', background: added[product.id] ? '#dcfce7' : '#16a34a', color: added[product.id] ? '#15803d' : 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        {added[product.id] ? <Check size={13} /> : <Plus size={13} />}
                        {added[product.id] ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
