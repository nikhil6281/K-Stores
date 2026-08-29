import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  RotateCcw, 
  Clock, 
  MessageSquare
} from 'lucide-react';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

export const OrderHistoryModal: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    orders,
    setActiveOrderId,
    setIsTrackingOpen,
    reorder,
    language,
    t
  } = useStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isHistoryOpen) return null;

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'completed') return o.status === 'delivered';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending (కన్ఫర్మ్)</span>;
      case 'packing':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Packing (ప్యాకింగ్)</span>;
      case 'out_for_delivery':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Out for Delivery 🛵</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered ✅</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              📦
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {t.myOrders}
              </h2>
              <p className="text-xs text-emerald-200">
                {orders.length} {language === 'te' ? 'ఆర్డర్లు నమోదయ్యాయి' : 'orders placed'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHistoryOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 px-4 pt-3 gap-2 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              filter === 'all' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              filter === 'active' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active 20-Min ({orders.filter(o => o.status !== 'delivered').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              filter === 'completed' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[65vh] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
                📦
              </div>
              <h4 className="font-bold text-slate-700 text-sm">{language === 'te' ? 'ఆర్డర్లు లేవు' : 'No Orders Found'}</h4>
              <p className="text-xs text-slate-500 mt-1">{language === 'te' ? 'మీరు ఇంకా ఎటువంటి ఆర్డర్ చేయలేదు' : 'You have not placed any orders yet'}</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' });
              const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-400 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-xs sm:text-sm">#{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {orderDate} at {orderTime} • {order.deliveryType === 'delivery_20min' ? '20-Min Delivery' : 'Store Pickup'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-extrabold text-slate-900">₹{order.totalAmount}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        {order.items.length} items (COD)
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="text-xs text-slate-600 space-y-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="truncate max-w-[280px]">
                          • {language === 'te' ? item.product.nameTe : item.product.nameEn} (x{item.quantity})
                        </span>
                        <span className="text-slate-500 font-medium">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-[10px] text-slate-400 italic">
                        +{order.items.length - 3} more items...
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveOrderId(order.id);
                          setIsHistoryOpen(false);
                          setIsTrackingOpen(true);
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-emerald-200 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Track Status</span>
                      </button>

                      <a
                        href={getWhatsAppOrderUrl(order, language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                        <span>WhatsApp Bill</span>
                      </a>
                    </div>

                    <button
                      onClick={() => reorder(order)}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.reorderBtn}</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
