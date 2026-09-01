import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Package, ArrowRight, Clock } from 'lucide-react';

export const OrderHistoryModal: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    orders,
    user,
    setIsAuthOpen,
    setIsTrackingOpen,
    setActiveOrderId,
    language
  } = useStore();

  if (!isHistoryOpen) return null;

  // Strict Customer Isolation: User only sees orders matching their account
  const userOrders = orders.filter((order: any) => {
    if (!user) return false;
    if (order.userId && user.id && order.userId === user.id) return true;
    if (order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (order.customerPhone && user.phone && order.customerPhone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {language === 'te' ? 'నా ఆర్డర్లు' : 'My Orders'}
              </h2>
              <p className="text-xs text-slate-500">
                {user ? `${user.name} (${userOrders.length} orders)` : 'Sign in to view orders'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!user ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#166534] flex items-center justify-center mx-auto text-2xl font-bold">
                🔒
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Please sign in to view your orders</h3>
              <button
                onClick={() => {
                  setIsHistoryOpen(false);
                  setIsAuthOpen(true);
                }}
                className="bg-[#166534] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
              >
                Sign in with Google
              </button>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl font-bold">
                🛍️
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">No orders found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You have not placed any orders with this account yet.
              </p>
            </div>
          ) : (
            userOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 font-mono">#{order.id}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'packing' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-700">
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.product?.nameEn || 'Item'} x {item.quantity}</span>
                      <span className="font-bold">₹{(item.product?.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">Total: ₹{order.totalAmount}</div>
                  <button
                    onClick={() => {
                      if (setActiveOrderId) setActiveOrderId(order.id);
                      setIsHistoryOpen(false);
                      setIsTrackingOpen(true);
                    }}
                    className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

