import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  RotateCcw, 
  Clock, 
  MessageSquare,
  Package
} from 'lucide-react';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

export const OrderHistoryModal: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    orders = [],
    setActiveOrderId,
    setIsTrackingOpen,
    reorder,
    user,
    setIsAuthOpen,
    language,
    t
  } = useStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isHistoryOpen) return null;

  // Filter orders for the active user if logged in, otherwise show recent device orders
  const userOrders = orders.filter(o => {
    if (!o) return false;
    if (user && user.phone) {
      const cleanUserPhone = user.phone.replace(/\D/g, '');
      const cleanOrderPhone = (o.customerPhone || '').replace(/\D/g, '');
      if (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) {
        return true;
      }
    }
    return true;
  });

  const filteredOrders = userOrders.filter(o => {
    if (!o) return false;
    const status = o.status || 'pending';
    if (filter === 'active') return status !== 'delivered' && status !== 'cancelled';
    if (filter === 'completed') return status === 'delivered';
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
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status || 'Processing'}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              📦
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {t.myOrders}
              </h2>
              <p className="text-xs text-emerald-100">
                {user ? `${user.name} • ` : ''}{userOrders.length} {language === 'te' ? 'ఆర్డర్లు నమోదయ్యాయి' : 'orders placed'}
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
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              filter === 'all' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Orders ({userOrders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              filter === 'active' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active 20-Min ({userOrders.filter(o => o?.status !== 'delivered' && o?.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              filter === 'completed' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed ({userOrders.filter(o => o?.status === 'delivered').length})
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[65vh] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {language === 'te' ? 'ఆర్డర్లు లేవు' : 'No Orders Found'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {user 
                    ? (language === 'te' ? 'మీ ఖాతాలో ఇంకా ఆర్డర్లు లేవు. సరుకులు ఆర్డర్ చేసి 20 నిమిషాల్లో పొందండి!' : 'You have no past orders in your account. Start shopping for 20-min delivery!')
                    : (language === 'te' ? 'మీ గత ఆర్డర్లు చూడటానికి దయచేసి లాగిన్ అవ్వండి.' : 'Please sign in to view your past orders.')}
                </p>
              </div>

              {!user && (
                <button
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Sign in to View Orders
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              if (!order) return null;

              const safeDate = order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                ? new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })
                : 'Today';
              const safeTime = order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              const orderItems = Array.isArray(order.items) ? order.items : [];
              const orderTotal = order.totalAmount ?? 0;
              const orderStatus = order.status || 'pending';

              return (
                <div 
                  key={order.id || Math.random().toString()}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-400 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-xs sm:text-sm">#{order.id || 'MK-Order'}</span>
                        {getStatusBadge(orderStatus)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {safeDate} at {safeTime} • {order.deliveryType === 'delivery_20min' ? '20-Min Delivery' : 'Store Pickup'}
                      </div>
                    </div>

                      <div className="text-right">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900">₹{orderTotal}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {orderItems.length} items • {order.paymentMethod === 'online_razorpay' ? '💳 Paid (Razorpay)' : order.paymentMethod === 'pay_on_pickup' ? 'Pay on Pickup' : 'Cash on Delivery'}
                        </div>
                      </div>
                  </div>

                  {/* Items preview */}
                  <div className="text-xs text-slate-600 space-y-1">
                    {orderItems.slice(0, 3).map((item, idx) => {
                      if (!item || !item.product) return null;
                      const pName = language === 'te' ? (item.product.nameTe || item.product.nameEn) : item.product.nameEn;
                      const pPrice = item.product.price ?? 0;
                      const pQty = item.quantity ?? 1;

                      return (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="truncate max-w-[280px]">
                            • {pName} (x{pQty})
                          </span>
                          <span className="text-slate-500 font-medium">₹{pPrice * pQty}</span>
                        </div>
                      );
                    })}
                    {orderItems.length > 3 && (
                      <div className="text-[10px] text-slate-400 italic">
                        +{orderItems.length - 3} more items...
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
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
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
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
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
