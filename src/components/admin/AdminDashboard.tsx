import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  Layers, 
  TrendingUp, 
  Tag, 
  LogOut, 
  Bell, 
  Phone, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  MapPin, 
  Search, 
  RotateCcw,
  Sparkles,
  DollarSign,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import type { Product, ProductCategory, OrderStatus } from '../../types';
import { sounds } from '../../utils/sound';
import { getCustomerStatusUpdateWhatsAppUrl, STORE_OWNER_DISPLAY_PHONE } from '../../utils/whatsapp';

export const AdminDashboard: React.FC = () => {
  const {
    products = [],
    updateProduct,
    addProduct,
    deleteProduct,
    resetInventory,
    orders = [],
    updateOrderStatus,
    deals = [],
    toggleDeal,
    setIsOwnerMode,
    refreshOrdersFromCloud,
    t,
    showToast
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics' | 'deals'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // New / Edit Product Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form state
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameTe, setFormNameTe] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('vegetables');
  const [formPrice, setFormPrice] = useState(30);
  const [formMrp, setFormMrp] = useState(35);
  const [formUnit, setFormUnit] = useState('1 kg');
  const [formUnitTe, setFormUnitTe] = useState('1 కేజీ');
  const [formStock, setFormStock] = useState(20);
  const [formMinAlert, setFormMinAlert] = useState(5);
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeDeals = Array.isArray(deals) ? deals : [];

  // Filtered orders
  const filteredOrders = safeOrders.filter(o => {
    if (!o) return false;
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Filtered inventory
  const filteredInventory = safeProducts.filter(p => {
    if (!p) return false;
    const nameEn = (p.nameEn || '').toLowerCase();
    const nameTe = p.nameTe || '';
    const q = inventorySearch.toLowerCase();
    const matchesSearch = nameEn.includes(q) || nameTe.includes(inventorySearch);
    if (showLowStockOnly) {
      return matchesSearch && (p.stock ?? 0) <= (p.minStockAlert ?? 5);
    }
    return matchesSearch;
  });

  // Analytics Computations with full null-safety
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const todayRevenue = safeOrders
    .filter(o => o?.createdAt && !isNaN(new Date(o.createdAt).getTime()) && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (o?.totalAmount || 0), 0) || totalRevenue;
  const avgOrderValue = safeOrders.length > 0 ? Math.round(totalRevenue / safeOrders.length) : 0;
  const deliveryOrdersCount = safeOrders.filter(o => o?.deliveryType === 'delivery_20min').length;
  const pickupOrdersCount = safeOrders.filter(o => o?.deliveryType === 'store_pickup').length;
  const lowStockCount = safeProducts.filter(p => (p?.stock ?? 0) <= (p?.minStockAlert ?? 5)).length;

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormNameEn(p.nameEn || '');
    setFormNameTe(p.nameTe || '');
    setFormCategory(p.category || 'vegetables');
    setFormPrice(p.price || 30);
    setFormMrp(p.mrp || 35);
    setFormUnit(p.unit || '1 kg');
    setFormUnitTe(p.unitTe || '1 కేజీ');
    setFormStock(p.stock || 20);
    setFormMinAlert(p.minStockAlert || 5);
    setFormImage(p.image || '');
    setIsAddModalOpen(true);
  };

  // Reset Product Form
  const openAddModal = () => {
    setEditingProduct(null);
    setFormNameEn('');
    setFormNameTe('');
    setFormCategory('vegetables');
    setFormPrice(30);
    setFormMrp(35);
    setFormUnit('1 kg');
    setFormUnitTe('1 కేజీ');
    setFormStock(25);
    setFormMinAlert(5);
    setFormImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn.trim() || !formNameTe.trim()) {
      showToast('error', 'Required Fields', 'Please provide both English and Telugu names');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        nameEn: formNameEn,
        nameTe: formNameTe,
        category: formCategory,
        price: Number(formPrice),
        mrp: Number(formMrp),
        unit: formUnit,
        unitTe: formUnitTe,
        stock: Number(formStock),
        minStockAlert: Number(formMinAlert),
        image: formImage
      });
    } else {
      addProduct({
        nameEn: formNameEn,
        nameTe: formNameTe,
        category: formCategory,
        price: Number(formPrice),
        mrp: Number(formMrp),
        unit: formUnit,
        unitTe: formUnitTe,
        stock: Number(formStock),
        minStockAlert: Number(formMinAlert),
        image: formImage,
        isVeg: true
      });
    }

    setIsAddModalOpen(false);
  };

  const handleStatusTransition = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Top Admin Bar */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base sm:text-lg">
                  {t.adminTitle}
                </h1>
                <span className="bg-purple-900 text-purple-200 border border-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIVE (PIN: 9874)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kirana Owner: {STORE_OWNER_DISPLAY_PHONE}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setIsSyncing(true);
                await refreshOrdersFromCloud();
                setTimeout(() => setIsSyncing(false), 500);
                showToast('success', 'Live Cloud Synced', 'Fetched all live orders across all devices.');
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Sync Orders across all devices"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud Orders</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <button
              onClick={() => {
                sounds.playOwnerNewOrderAlert();
                showToast('info', 'Sound Test', 'Live order sound alert played.');
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Chime</span>
            </button>

            <button
              onClick={() => setIsOwnerMode(false)}
              className="flex items-center gap-1.5 text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logoutAdmin}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.tabOrders}</span>
            {safeOrders.filter(o => o?.status !== 'delivered').length > 0 && (
              <span className="bg-amber-400 text-purple-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                {safeOrders.filter(o => o?.status !== 'delivered').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.tabInventory}</span>
            {lowStockCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {lowStockCount} Low
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.tabAnalytics}</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t.tabDeals}</span>
          </button>
        </div>

        {/* TAB 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Status Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All (${safeOrders.length})` },
                  { id: 'pending', label: `Pending (${safeOrders.filter(o => o?.status === 'pending').length})` },
                  { id: 'packing', label: `Packing (${safeOrders.filter(o => o?.status === 'packing').length})` },
                  { id: 'out_for_delivery', label: `Out for Delivery (${safeOrders.filter(o => o?.status === 'out_for_delivery').length})` },
                  { id: 'delivered', label: `Delivered (${safeOrders.filter(o => o?.status === 'delivered').length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      orderStatusFilter === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t.newOrderAlertSound}</span>
              </div>
            </div>

            {/* Order Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-800/60 rounded-3xl p-10 text-center border border-slate-800 space-y-3">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-300 text-sm">{t.noOrdersFound}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  New orders placed by customers across any phone or laptop will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map(order => {
                  if (!order) return null;
                  const orderDate = order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                    ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Recent';
                  
                  const status = order.status || 'pending';
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  const custName = order.customerName || 'Customer';
                  const custPhone = order.customerPhone || '';
                  const totalAmt = order.totalAmount ?? 0;

                  return (
                    <div 
                      key={order.id || Math.random().toString()}
                      className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 shadow-lg space-y-3.5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Order Top Strip */}
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-base">#{order.id || 'MK-Order'}</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              status === 'pending' ? 'bg-amber-400 text-slate-950 animate-pulse' :
                              status === 'packing' ? 'bg-blue-400 text-slate-950' :
                              status === 'out_for_delivery' ? 'bg-purple-400 text-slate-950' :
                              'bg-emerald-400 text-slate-950'
                            }`}>
                              {status.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="text-xs text-slate-400 font-medium">
                            {orderDate}
                          </span>
                        </div>

                        {/* Customer Details */}
                        <div className="py-2 space-y-1 text-xs text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{custName}</span>
                            <span className="text-emerald-400 font-bold text-sm">₹{totalAmt} (COD)</span>
                          </div>
                          
                          {custPhone && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-purple-400" />
                              <span>+91 {custPhone}</span>
                            </div>
                          )}

                          {order.address && (
                            <div className="flex items-start gap-2 text-slate-300 pt-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span>{order.address.doorNo ? `${order.address.doorNo}, ` : ''}{order.address.villageName}</span>
                                {order.address.landmark && (
                                  <div className="text-amber-300 font-bold text-[11px]">📍 Landmark: {order.address.landmark}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {order.notes && (
                            <div className="text-slate-400 italic text-[11px] pt-1">
                              Note: "{order.notes}"
                            </div>
                          )}
                        </div>

                        {/* Itemized List */}
                        <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700/60 space-y-1 text-xs">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {orderItems.length} Grocery Items:
                          </div>
                          {orderItems.map((item, idx) => {
                            if (!item || !item.product) return null;
                            const pName = item.product.nameEn || 'Item';
                            const pUnit = item.product.unit || '';
                            const pPrice = item.product.price ?? 0;
                            const pQty = item.quantity ?? 1;

                            return (
                              <div key={idx} className="flex justify-between items-center text-slate-300">
                                <span className="truncate max-w-[220px]">
                                  • {pName} {pUnit ? `(${pUnit})` : ''} x{pQty}
                                </span>
                                <span className="font-semibold text-slate-400">₹{pPrice * pQty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-700/80 space-y-2">
                        {/* Status Change Steppers */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => handleStatusTransition(order.id, 'packing')}
                            disabled={status === 'packing' || status === 'out_for_delivery' || status === 'delivered'}
                            className="bg-blue-600/80 hover:bg-blue-600 disabled:opacity-30 text-white font-bold py-2 px-1 rounded-xl text-[11px] transition-colors text-center cursor-pointer"
                          >
                            1. Mark Packing
                          </button>

                          <button
                            onClick={() => handleStatusTransition(order.id, 'out_for_delivery')}
                            disabled={status === 'out_for_delivery' || status === 'delivered'}
                            className="bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 text-white font-bold py-2 px-1 rounded-xl text-[11px] transition-colors text-center cursor-pointer"
                          >
                            2. Out for 20M
                          </button>

                          <button
                            onClick={() => handleStatusTransition(order.id, 'delivered')}
                            disabled={status === 'delivered'}
                            className="bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-30 text-white font-bold py-2 px-1 rounded-xl text-[11px] transition-colors text-center cursor-pointer"
                          >
                            3. Delivered ✅
                          </button>
                        </div>

                        {/* WhatsApp / Call Customer */}
                        <div className="flex items-center gap-2">
                          {custPhone ? (
                            <>
                              <a
                                href={getCustomerStatusUpdateWhatsAppUrl(order, status)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <a
                                href={`tel:+91${custPhone.replace(/\D/g, '')}`}
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-2 rounded-xl text-xs transition-colors"
                                title="Call Customer"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 italic py-1">No phone number provided</div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            
            {/* Action & Search Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 p-4 rounded-3xl border border-slate-700">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder={t.searchInventory}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    showLowStockOnly
                      ? 'bg-red-900 text-red-200 border-red-700'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{t.filterLowStock} ({lowStockCount})</span>
                </button>

                <button
                  onClick={openAddModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNewProduct}</span>
                </button>

                <button
                  onClick={resetInventory}
                  className="bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  title="Reset Catalog"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price / MRP</th>
                      <th className="p-3.5">Stock Level</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredInventory.map((p) => {
                      if (!p) return null;
                      const isLow = (p.stock ?? 0) <= (p.minStockAlert ?? 5);
                      const catName = (p.category || 'general').replace('_', ' ');

                      return (
                        <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60'}
                              alt={p.nameEn || 'Product'}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-900 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{p.nameEn || 'Product'}</div>
                              <div className="text-[11px] text-purple-300 font-medium">{p.nameTe || ''}</div>
                              <div className="text-[10px] text-slate-400">{p.unit || ''}</div>
                            </div>
                          </td>

                          <td className="p-3.5 capitalize font-medium text-slate-300">
                            {catName}
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-emerald-400">₹{p.price ?? 0}</div>
                            <div className="text-[10px] text-slate-400 line-through">₹{p.mrp ?? 0}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                                p.stock === 0 ? 'bg-red-950 text-red-300 border border-red-800' :
                                isLow ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-slate-900 text-slate-200'
                              }`}>
                                {p.stock ?? 0}
                              </span>

                              {isLow && (
                                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3" /> Low
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(p)}
                              className="bg-slate-700 hover:bg-slate-600 text-purple-300 p-2 rounded-xl transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="bg-red-950/80 hover:bg-red-900 text-red-300 p-2 rounded-xl transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SALES & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>{t.todaySales}</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">₹{todayRevenue}</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <ArrowUpRight className="w-3 h-3" /> 20-Min Fast Orders
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>{t.totalOrdersCount}</span>
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{safeOrders.length}</div>
                <div className="text-[11px] text-purple-300 mt-1 font-medium">
                  {deliveryOrdersCount} Home Delivery | {pickupOrdersCount} Pickup
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>{t.avgOrderValue}</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">₹{avgOrderValue}</div>
                <div className="text-[11px] text-amber-300 mt-1 font-medium">
                  Village grocery basket size
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Low Stock Alert</span>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-black text-red-400">{lowStockCount}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Items below min threshold
                </div>
              </div>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Selling Items */}
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.topSellingItems}</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'Fresh Farm Tomatoes (నాటు టమాటాలు)', count: 48, percent: 90 },
                    { name: 'Sona Masoori Rice 5kg (సోనా మసూరి)', count: 35, percent: 75 },
                    { name: 'Heritage Special Buffalo Milk (తాజా పాలు)', count: 32, percent: 70 },
                    { name: 'Aashirvaad Chakki Atta 5kg (గోధుమ పిండి)', count: 28, percent: 60 },
                    { name: 'Gold Drop Sunflower Oil (సన్‌ఫ్లవర్ నూనె)', count: 22, percent: 48 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200">{item.name}</span>
                        <span className="text-purple-300 font-bold">{item.count} orders</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Order Trends */}
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
                <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{t.orderTrends}</span>
                </h3>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">20-Min Village Delivery</div>
                      <div className="text-[11px] text-slate-400">Cash on Delivery & WhatsApp Bill</div>
                    </div>
                    <span className="text-base font-black text-emerald-400">82%</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Store Counter Pickup</div>
                      <div className="text-[11px] text-slate-400">5-Min Self Collection</div>
                    </div>
                    <span className="text-base font-black text-amber-400">18%</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Peak Ordering Hours</div>
                      <div className="text-[11px] text-slate-400">Morning 7:00 AM - 10:30 AM & Evening 5:00 PM - 8:30 PM</div>
                    </div>
                    <span className="text-xs font-bold text-purple-300">High Demand</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: DEALS & PROMOTIONS */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Store Promotions & Deals
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control active discounts and village delivery promotional codes
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {safeDeals.map(deal => {
                  if (!deal) return null;
                  return (
                    <div 
                      key={deal.id}
                      className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{deal.titleEn}</span>
                          <span className="bg-purple-900 text-purple-200 border border-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {deal.code}
                          </span>
                        </div>
                        <div className="text-xs text-purple-300 font-medium">{deal.titleTe}</div>
                        <div className="text-[11px] text-slate-400">{deal.subtitleEn} • Min Order: ₹{deal.minOrder}</div>
                      </div>

                      <button
                        onClick={() => toggleDeal(deal.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          deal.active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {deal.active ? '✓ Active on App' : 'Disabled'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 animate-scale-up">
            
            <h3 className="font-black text-lg text-white">
              {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="e.g. Fresh Tomatoes"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name (Telugu - తెలుగు) *</label>
                <input
                  type="text"
                  required
                  value={formNameTe}
                  onChange={(e) => setFormNameTe(e.target.value)}
                  placeholder="ఉదా: తాజా నాటు టమాటాలు"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="vegetables">Vegetables (కూరగాయలు)</option>
                    <option value="fruits">Fruits (పండ్లు)</option>
                    <option value="dairy">Dairy & Bread (పాలు & బ్రెడ్)</option>
                    <option value="staples">Rice & Atta & Dals (బియ్యం & పప్పులు)</option>
                    <option value="snacks">Snacks (స్నాక్స్)</option>
                    <option value="spices">Spices & Oils (మసాలాలు)</option>
                    <option value="beverages">Beverages (కూల్ డ్రింక్స్)</option>
                    <option value="household">Household (ఇంటి శుభ్రత)</option>
                    <option value="personal_care">Personal Care (సబ్బులు)</option>
                    <option value="pooja">Pooja Items (పూజా సామాగ్రి)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Unit (e.g. 1 kg, 500 ml)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
