import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Product, 
  CartItem, 
  Order, 
  OrderStatus, 
  DeliveryType, 
  DeliveryAddress, 
  CustomerUser, 
  PaymentMethod,
  Language,
  ToastNotification 
} from '../types';
import { initialProducts } from '../data/initialProducts';
import { 
  fetchCloudProducts, 
  saveCloudProduct, 
  deleteCloudProduct, 
  fetchCloudStoreData, 
  addOrderToCloud, 
  updateCloudOrderStatus,
  onBroadcastOrderUpdate 
} from '../services/cloudSync';
import { sounds } from '../utils/sounds';
import { generateWhatsAppOrderURL } from '../utils/whatsapp';

export interface StoreContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleDeal: (productId: string) => void;
  refreshProductsFromCloud: () => Promise<void>;
  
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  orders: Order[];
  placeOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrdersFromCloud: () => Promise<void>;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  user: CustomerUser | null;
  setUser: (user: CustomerUser | null) => void;
  
  language: Language;
  setLanguage: (lang: Language) => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isOwnerMode: boolean;
  setIsOwnerMode: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  isSuccessOpen: boolean;
  setIsSuccessOpen: (open: boolean) => void;

  toasts: ToastNotification[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products State with Cloud Sync
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  const refreshProductsFromCloud = useCallback(async () => {
    const cloudList = await fetchCloudProducts();
    if (Array.isArray(cloudList) && cloudList.length > 0) {
      setProducts(cloudList);
    }
  }, []);

  useEffect(() => {
    refreshProductsFromCloud();
    // Poll cloud products every 10 seconds so customer sees real-time price updates
    const interval = setInterval(refreshProductsFromCloud, 10000);
    return () => clearInterval(interval);
  }, [refreshProductsFromCloud]);

  const addProduct = async (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    await saveCloudProduct(newProduct);
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    await saveCloudProduct(updatedProduct);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteCloudProduct(id);
  };

  const toggleDeal = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (target) {
      const updated = { ...target, isDeal: !target.isDeal };
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      await saveCloudProduct(updated);
    }
  };

  // 2. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kstores_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kstores_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
    sounds.playAddToCart();
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 3. Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const refreshOrdersFromCloud = useCallback(async () => {
    const data = await fetchCloudStoreData();
    if (data && Array.isArray(data.orders)) {
      setOrders(data.orders);
    }
  }, []);

  useEffect(() => {
    refreshOrdersFromCloud();
    const unsub = onBroadcastOrderUpdate((updatedOrders) => {
      setOrders(updatedOrders);
    });
    const interval = setInterval(refreshOrdersFromCloud, 4000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [refreshOrdersFromCloud]);

  const placeOrder = async (orderData: any): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: `MK-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedList = await addOrderToCloud(newOrder);
    setOrders(updatedList);
    clearCart();
    setActiveOrderId(newOrder.id);
    sounds.playOrderSuccess();

    // Auto-open WhatsApp to owner
    try {
      window.open(generateWhatsAppOrderURL(newOrder, language === 'te'), '_blank');
    } catch {}

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    await updateCloudOrderStatus(orderId, status);
  };

  // 4. Modals and User State
  const [user, setUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('kstores_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem('kstores_user', JSON.stringify(user));
    else localStorage.removeItem('kstores_user');
  }, [user]);

  const [language, setLanguage] = useState<Language>('en');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // 5. Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <StoreContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleDeal,
      refreshProductsFromCloud,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      orders,
      placeOrder,
      updateOrderStatus,
      refreshOrdersFromCloud,
      activeOrderId,
      setActiveOrderId,
      user,
      setUser,
      language,
      setLanguage,
      isCartOpen,
      setIsCartOpen,
      isAuthOpen,
      setIsAuthOpen,
      isHistoryOpen,
      setIsHistoryOpen,
      isTrackingOpen,
      setIsTrackingOpen,
      isOwnerMode,
      setIsOwnerMode,
      isAdminLoginOpen,
      setIsAdminLoginOpen,
      isSuccessOpen,
      setIsSuccessOpen,
      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
