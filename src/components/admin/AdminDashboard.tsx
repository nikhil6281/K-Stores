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
  
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 600;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h > max) { w = Math.round(w * max / h); h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setNewProduct(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.85) }));
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
    <div style={{gridColumn:'1/-1'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:600,marginBottom:'8px',color:'#374151'}}>Product Photo</label>
              {newProduct.image ? (
                <div style={{position:'relative',borderRadius:'12px',overflow:'hidden',border:'2px solid #16a34a',height:'160px'}}>
                  <img src={newProduct.image} alt="Preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  <label htmlFor="cam-input" style={{position:'absolute',bottom:'8px',right:'8px',background:'#16a34a',color:'white',padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Change Photo</label>
                </div>
              ) : (
                <label htmlFor="cam-input" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',border:'2px dashed #16a34a',borderRadius:'12px',padding:'32px',cursor:'pointer',background:'#f0fdf4'}}>
                  <span style={{fontSize:'2rem'}}>📷</span>
                  <span style={{fontWeight:700,color:'#166534',fontSize:'14px'}}>Click to Open Camera</span>
                  <span style={{fontSize:'12px',color:'#6b7280'}}>Or select from gallery</span>
                </label>
              )}
              <input id="cam-input" type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{display:'none'}} />
            </div>
      )}

    </div>
  );
};

