import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Package, ArrowRight } from 'lucide-react';

export const OrderHistoryModal: React.FC = () => {
  const {
    isHistoryOpen,
    setIsHistoryOpen,
    orders,
    user,
    setIsAuthOpen,
    setIsTrackingOpen,
    setActiveOrder,
    language
  } = useStore();

  if (!isHistoryOpen) return null;

  const userOrders = orders.filter(order => {
    if (!user) return false;
    if (order.userId && user.id && order.userId === user.id) return true;
    if (order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (order.customerPhone && user.phone && order.customerPhone === user.phone) return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9e1a22] text-white flex items-center justify-center font-bold">
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!user ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#9e1a22] flex items-center justify-center mx-auto text-2xl font-bold">
                🔒
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Please sign in to view your orders</h3>
              <button
                onClick={() => {
                  setIsHistoryOpen(false);
                  setIsAuthOpen(true);
                }}
                className="bg-[#9e1a22] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
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
            userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="font-black text-xs text-slate-900 font-mono">#{order.id}</div>
                    <div className="text-[11px] text-slate-500">{order.createdAt?.slice(0, 16).replace('T', ' ')}</div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-800">
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.product.nameEn} x {item.quantity}</span>
                      <span className="font-bold">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">Total: ₹{order.totalAmount}</div>
                  <button
                    onClick={() => {
                      setActiveOrder(order);
                      setIsHistoryOpen(false);
                      setIsTrackingOpen(true);
                    }}
                    className="text-xs font-bold text-[#9e1a22] hover:underline flex items-center gap-1"
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
