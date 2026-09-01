import React, { useState, useEffect } from 'react';
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
  Square,
  Plus,
  Trash2,
  Edit3,
  Flame,
  Tag,
  Sliders,
  Store,
  Zap,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { STORE_OWNER_DISPLAY_PHONE, getWhatsAppOrderUrl } from '../../utils/whatsapp';
import type { OrderStatus, ProductCategory, Product } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    refreshOrdersFromCloud,
    setIsOwnerMode,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleDeal,
    language,
    showToast
  } = useStore();

  // Tab State: 'orders' | 'inventory' | 'store_controls'
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'store_controls'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [packedItems, setPackedItems] = useState<{ [key: string]: boolean }>({});

  // Store Controls State (Persisted)
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(() => {
    return localStorage.getItem('kstores_store_open') !== 'false';
  });
  const [deliveryTimeMinutes, setDeliveryTimeMinutes] = useState<number>(() => {
    return Number(localStorage.getItem('kstores_delivery_mins')) || 20;
  });

  useEffect(() => {
    localStorage.setItem('kstores_store_open', String(isStoreOpen));
  }, [isStoreOpen]);

  useEffect(() => {
    localStorage.setItem('kstores_delivery_mins', String(deliveryTimeMinutes));
  }, [deliveryTimeMinutes]);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductNameEn, setNewProductNameEn] = useState('');
  const [newProductNameTe, setNewProductNameTe] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('vegetables');
  const [newProductPrice, setNewProductPrice] = useState('30');
  const [newProductMrp, setNewProductMrp] = useState('35');
  const [newProductUnit, setNewProductUnit] = useState('1 kg');
  const [newProductStock, setNewProductStock] = useState('50');
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80');

  // Inline Price Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>('');
  const [editMrpVal, setEditMrpVal] = useState<string>('');

  const togglePacked = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setPackedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !orderSearchQuery || 
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerPhone.includes(orderSearchQuery);
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter(prod => {
    const matchesCat = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
    const matchesSearch = !productSearchQuery ||
      prod.nameEn.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (prod.nameTe && prod.nameTe.toLowerCase().includes(productSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const packingCount = orders.filter(o => o.status === 'packing').length;
  const outCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    showToast('success', 'Order Status Updated', `Order #${orderId} marked as ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductNameEn.trim()) {
      showToast('error', 'Required', 'Enter product name in English');
      return;
    }
    if (addProduct) {
      const prod: Product = {
        id: `prod_${Date.now()}`,
        nameEn: newProductNameEn.trim(),
        nameTe: newProductNameTe.trim() || newProductNameEn.trim(),
        category: newProductCategory,
        price: Number(newProductPrice) || 10,
        mrp: Number(newProductMrp) || Number(newProductPrice) || 12,
        unit: newProductUnit.trim() || '1 kg',
        unitTe: newProductUnit.trim() || '1 kg',
        stock: Number(newProductStock) || 50,
        minStockAlert: 5,
        image: newProductImage.trim(),
        isVeg: true,
        isDeal: false
      };
      addProduct(prod);
      setIsAddModalOpen(false);
      setNewProductNameEn('');
      setNewProductNameTe('');
      showToast('success', 'Product Added', `${prod.nameEn} added to catalog.`);
    }
  };

  const saveInlinePrice = (prod: Product) => {
    if (updateProduct) {
      updateProduct({
        ...prod,
        price: Number(editPriceVal) || 10,
        mrp: Number(editMrpVal) || Number(editPriceVal) || 12
      });
      setEditingPriceId(null);
      showToast('success', 'Price Saved', `${prod.nameEn} price updated to ₹${editPriceVal}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9e1a22] text-white flex items-center justify-center font-black text-lg shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white text-base sm:text-lg tracking-wide">
                  {language === 'te' ? 'స్టోర్ ఓనర్ మేనేజ్‌మెంట్' : 'Store Owner Portal'}
                </h1>
                <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kirana Owner: <span className="text-slate-200 font-mono">{STORE_OWNER_DISPLAY_PHONE}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-[#9e1a22] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inventory' ? 'bg-[#9e1a22] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Catalog ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('store_controls')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'store_controls' ? 'bg-[#9e1a22] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Controls</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setIsSyncing(true);
                await refreshOrdersFromCloud();
                setTimeout(() => setIsSyncing(false), 500);
                showToast('success', 'Cloud Synced', 'Fresh orders fetched.');
              }}
              disabled={isSyncing}
              className="flex items-center gap-1 text-xs bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => setIsOwnerMode(false)}
              className="flex items-center gap-1 text-xs font-bold bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* =====================================================================
            TAB 1: LIVE ORDERS
        ====================================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Status Metrics */}
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
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search order ID, name, phone..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#9e1a22]"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center text-3xl mx-auto">
                  📦
                </div>
                <h3 className="font-extrabold text-white text-base">No orders found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Incoming orders will appear here automatically with real-time alerts.
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
                      {/* Top Bar */}
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

                      {/* Customer Details */}
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

                      {/* Packing Checklist */}
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

          </div>
        )}

        {/* =====================================================================
            TAB 2: CATALOG & INVENTORY MANAGEMENT
        ====================================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800">
              <div>
                <h2 className="font-extrabold text-white text-base">Store Catalog & Prices</h2>
                <p className="text-xs text-slate-400">Total Products: {products.length} • Low Stock: {lowStockCount}</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#9e1a22] hover:bg-[#83181d] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter Category & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  'all', 'vegetables', 'fruits', 'dairy', 'staples', 'snacks', 'beverages'
                ].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      productCategoryFilter === cat
                        ? 'bg-[#9e1a22] text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#9e1a22]"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(prod => {
                const isEditing = editingPriceId === prod.id;

                return (
                  <div 
                    key={prod.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex items-start gap-3">
                        <img 
                          src={prod.image} 
                          alt={prod.nameEn} 
                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 bg-slate-950" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-extrabold text-sm text-white truncate">{prod.nameEn}</h3>
                            {prod.isDeal && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>OFFER</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{prod.nameTe}</p>
                          <p className="text-[11px] text-slate-500 capitalize mt-0.5">Unit: {prod.unit} • {prod.category}</p>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400">Price ₹</span>
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={(e) => setEditPriceVal(e.target.value)}
                                className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400">MRP ₹</span>
                              <input
                                type="number"
                                value={editMrpVal}
                                onChange={(e) => setEditMrpVal(e.target.value)}
                                className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                              />
                            </div>
                            <button
                              onClick={() => saveInlinePrice(prod)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg text-xs font-bold mt-3.5 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="bg-slate-800 text-slate-400 p-1.5 rounded-lg text-xs mt-3.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-black text-base text-white">₹{prod.price}</div>
                            {prod.mrp > prod.price && (
                              <div className="text-xs text-slate-500 line-through">₹{prod.mrp}</div>
                            )}
                            <button
                              onClick={() => {
                                setEditingPriceId(prod.id);
                                setEditPriceVal(String(prod.price));
                                setEditMrpVal(String(prod.mrp));
                              }}
                              className="text-slate-400 hover:text-white p-1 rounded-md bg-slate-800 cursor-pointer"
                              title="Edit Price"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="text-right">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            prod.stock < 10 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-slate-300'
                          }`}>
                            Stock: {prod.stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Refill & Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Refill:</span>
                        <button
                          onClick={() => updateProduct && updateProduct({ ...prod, stock: prod.stock + 5 })}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateProduct && updateProduct({ ...prod, stock: prod.stock + 10 })}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          +10
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleDeal && toggleDeal(prod.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                            prod.isDeal 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{prod.isDeal ? 'Offer ON' : 'Make Deal'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${prod.nameEn} from catalog?`)) {
                              if (deleteProduct) deleteProduct(prod.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 3: STORE CONTROLS & OPERATIONS
        ====================================================================== */}
        {activeTab === 'store_controls' && (
          <div className="space-y-6 max-w-4xl">
            
            {/* Store Status Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    isStoreOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Store Ordering Status</h3>
                    <p className="text-xs text-slate-400">
                      {isStoreOpen ? 'Customers can place 20-min grocery orders online.' : 'Store is currently CLOSED. Ordering is paused.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                    isStoreOpen ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isStoreOpen ? '🟢 STORE IS OPEN' : '🔴 STORE IS CLOSED'}
                </button>
              </div>
            </div>

            {/* Delivery Speed Controller */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-2xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Delivery Guarantee Speed</h3>
                  <p className="text-xs text-slate-400">Current target delivery timer shown to village customers.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[15, 20, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDeliveryTimeMinutes(mins)}
                    className={`py-3 px-4 rounded-2xl font-black text-sm border transition-all cursor-pointer text-center ${
                      deliveryTimeMinutes === mins
                        ? 'bg-[#9e1a22] text-white border-[#9e1a22] shadow-lg ring-2 ring-red-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ⚡ {mins} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-white text-base">Low Stock Alerts ({lowStockCount} items)</h3>
              </div>

              {lowStockCount === 0 ? (
                <p className="text-xs text-slate-400">All products have sufficient stock! 🛒</p>
              ) : (
                <div className="space-y-2">
                  {products.filter(p => p.stock < 10).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="font-bold text-white">{p.nameEn} ({p.nameTe})</span>
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-bold">Only {p.stock} left!</span>
                        <button
                          onClick={() => updateProduct && updateProduct({ ...p, stock: p.stock + 20 })}
                          className="bg-[#9e1a22] hover:bg-[#83181d] text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                        >
                          +20 Stock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* =====================================================================
          ADD NEW PRODUCT MODAL
      ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-slate-900 text-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-scale-up">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#9e1a22] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-base">Add New Grocery Product</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Name (English)*</label>
                  <input
                    type="text"
                    required
                    value={newProductNameEn}
                    onChange={(e) => setNewProductNameEn(e.target.value)}
                    placeholder="e.g. Fresh Tomatoes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Name (Telugu)</label>
                  <input
                    type="text"
                    value={newProductNameTe}
                    onChange={(e) => setNewProductNameTe(e.target.value)}
                    placeholder="e.g. తాజా టమాటాలు"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy & Eggs</option>
                    <option value="staples">Staples & Atta</option>
                    <option value="snacks">Snacks & Biscuits</option>
                    <option value="beverages">Beverages & Tea</option>
                    <option value="household">Household Cleaners</option>
                    <option value="personal_care">Personal Care</option>
                    <option value="pooja">Pooja Needs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Unit Weight / Size</label>
                  <input
                    type="text"
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    placeholder="e.g. 1 kg, 500 g, 1 L"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Selling Price (₹)*</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={newProductMrp}
                    onChange={(e) => setNewProductMrp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#9e1a22]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#9e1a22] hover:bg-[#83181d] text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
              >
                + Add Product to Store
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
