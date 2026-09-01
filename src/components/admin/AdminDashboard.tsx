import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  Clock, 
  RotateCcw, 
  LogOut, 
  Phone, 
  MapPin, 
  MessageSquare, 
   
  Search, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE, getWhatsAppOrderUrl } from '../../utils/whatsapp';
import type { OrderStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    refreshOrdersFromCloud,
    setIsOwnerMode,
    language,
    showToast
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [packedItems, setPackedItems] = useState<{ [key: string]: boolean }>({});

  const togglePacked = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setPackedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const packingCount = orders.filter(o => o.status === 'packing').length;
  const outCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    showToast('success', 'Order Status Updated', `Order #${orderId} marked as ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9e1a22] text-white flex items-center justify-center font-black text-lg shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white text-base sm:text-lg tracking-wide">
                  {language === 'te' ? 'స్టోర్ ఓనర్ మేనేజ్‌మెంట్' : 'Store Owner Management Portal'}
                </h1>
                <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kirana Owner: <span className="text-slate-200 font-mono">{STORE_OWNER_DISPLAY_PHONE}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={async () => {
                setIsSyncing(true);
                await refreshOrdersFromCloud();
                setTimeout(() => setIsSyncing(false), 500);
                showToast('success', 'Live Cloud Synced', 'Fetched fresh orders across all devices.');
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="font-bold">{isSyncing ? 'Syncing...' : 'Sync Orders'}</span>
            </button>

            <button
              onClick={() => setIsOwnerMode(false)}
              className="flex items-center gap-1.5 text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Owner Mode</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Pending Orders</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Packing Now</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{packingCount}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Out for Delivery</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{outCount}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Delivered</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{deliveredCount}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 font-medium">Delivered Revenue</div>
            <div className="text-2xl font-black text-white mt-1">₹{totalRevenue}</div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'packing', label: `Packing (${packingCount})` },
              { id: 'out_for_delivery', label: `Out (${outCount})` },
              { id: 'delivered', label: `Delivered (${deliveredCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#9e1a22] text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, name, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#9e1a22]"
            />
          </div>
        </div>

        {/* Orders List Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center text-3xl mx-auto">
              📦
            </div>
            <h3 className="font-extrabold text-white text-base">No orders found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When customers place orders, they will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrders.map((order) => {
              const totalItems = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
              const isPaidOnline = order.paymentMethod === 'online_razorpay';

              return (
                <div 
                  key={order.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-white">
                          #{order.id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-400 text-black animate-pulse' :
                          order.status === 'packing' ? 'bg-blue-500 text-white' :
                          order.status === 'out_for_delivery' ? 'bg-purple-500 text-white' :
                          order.status === 'delivered' ? 'bg-emerald-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        <span>•</span>
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-lg text-white">
                        ₹{order.totalAmount}
                      </div>
                      <div className={`text-[10px] font-bold ${isPaidOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isPaidOnline ? 'PAID ONLINE (Razorpay)' : 'CASH ON DELIVERY (COD)'}
                      </div>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="p-4 sm:p-5 py-3 bg-slate-950/40 border-b border-slate-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-white text-sm">
                        👤 {order.customerName}
                      </div>
                      <a 
                        href={`tel:${order.customerPhone}`}
                        className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-lg"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>+91 {order.customerPhone}</span>
                      </a>
                    </div>

                    {order.deliveryType === 'delivery_20min' && order.address ? (
                      <div className="text-slate-300 space-y-0.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-start gap-1.5 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-[#9e1a22] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white">
                              {order.address.doorNo ? `${order.address.doorNo}, ` : ''}{order.address.villageName}
                            </span>
                            <div className="text-amber-300 font-semibold mt-0.5">
                              📍 Landmark: {order.address.landmark}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-purple-950/40 border border-purple-800/60 text-purple-200 px-3 py-1.5 rounded-xl font-bold text-[11px]">
                        🏬 Store Pickup (Customer will collect from shop)
                      </div>
                    )}
                  </div>

                  {/* FULL PACKING CHECKLIST */}
                  <div className="p-4 sm:p-5 py-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span>PACKING LIST ({totalItems} ITEMS):</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">Click item to mark packed</span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {order.items && order.items.map((item, idx) => {
                        const isPacked = packedItems[`${order.id}-${idx}`];
                        const nameEn = item.product?.nameEn || 'Item';
                        const nameTe = item.product?.nameTe || '';
                        const unit = item.product?.unit || '';

                        return (
                          <div 
                            key={idx}
                            onClick={() => togglePacked(order.id, idx)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isPacked 
                                ? 'bg-emerald-950/40 border-emerald-800/80 text-slate-400 line-through' 
                                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="text-emerald-400">
                                {isPacked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate">
                                  {nameEn} {nameTe ? `(${nameTe})` : ''}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Unit: {unit} • Qty: <span className="font-black text-amber-300">x{item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-mono font-bold text-xs flex-shrink-0 ml-2">
                              ₹{(item.product?.price || 0) * item.quantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 sm:p-5 pt-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
                    
                    {/* Status Stepper */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'packing')}
                        disabled={order.status === 'packing'}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          order.status === 'packing'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : 'bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800/80'
                        }`}
                      >
                        1. Packing
                      </button>

                      <button
                        onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                        disabled={order.status === 'out_for_delivery'}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          order.status === 'out_for_delivery'
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                            : 'bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/80'
                        }`}
                      >
                        2. Out (20M)
                      </button>

                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        disabled={order.status === 'delivered'}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          order.status === 'delivered'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80'
                        }`}
                      >
                        3. Delivered ✅
                      </button>
                    </div>

                    {/* WhatsApp Button */}
                    <a
                      href={getWhatsAppOrderUrl(order, language)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Bill & Status Update to Customer</span>
                    </a>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

