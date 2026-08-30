import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { 
  Product, 
  CartItem, 
  Order, 
  OrderStatus, 
  CustomerUser, 
  DeliveryType, 
  Language, 
  ToastNotification,
  ProductCategory
} from '../types';
import { initialProducts } from '../data/products';
import { translations } from '../utils/translations';
import { sounds } from '../utils/sounds';
import { 
  subscribeToLiveOrders, 
  subscribeToUserCart, 
  syncCartToCloud, 
  pushOrderToCloud, 
  updateOrderStatusInCloud 
} from '../services/firebaseSync';

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartItemsCount: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  deliveryFee: number;
  minOrderForFreeDelivery: number;

  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address?: any;
    notes?: string;
    paymentMethod: any;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrdersFromCloud: () => Promise<void>;

  user: CustomerUser | null;
  setUser: (user: CustomerUser | null) => void;

  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isOwnerMode: boolean;
  setIsOwnerMode: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;

  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  toasts: ToastNotification[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kstores_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kstores_language', lang);
  };

  const t = translations[language] || translations['en'];

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kstores_products_v3');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [user, setUserState] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('kstores_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setUser = (newUser: CustomerUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('kstores_user_session', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('kstores_user_session');
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kstores_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kstores_orders_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery_20min');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const prevOrdersCountRef = useRef(orders.length);
  const isOwnerModeRef = useRef(isOwnerMode);
  useEffect(() => {
    isOwnerModeRef.current = isOwnerMode;
  }, [isOwnerMode]);

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Live Orders Subscription from Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToLiveOrders((incomingOrders) => {
      if (Array.isArray(incomingOrders)) {
        setOrders(incomingOrders);
        localStorage.setItem('kstores_orders_list', JSON.stringify(incomingOrders));

        if (isOwnerModeRef.current && incomingOrders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
          sounds.playOwnerNewOrderAlert();
          showToast('success', '🔔 New Live Customer Order!', `Order #${incomingOrders[0].id} for ₹${incomingOrders[0].totalAmount}`);
        }
        prevOrdersCountRef.current = incomingOrders.length;
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  // 2. Real-time User Cart Sync across devices
  useEffect(() => {
    if (user && user.id) {
      const unsubscribe = subscribeToUserCart(user.id, (cloudCart) => {
        if (Array.isArray(cloudCart)) {
          setCart(cloudCart);
          localStorage.setItem('kstores_cart_items', JSON.stringify(cloudCart));
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Save Cart to local & Firebase
  useEffect(() => {
    localStorage.setItem('kstores_cart_items', JSON.stringify(cart));
    if (user && user.id) {
      syncCartToCloud(user.id, cart);
    }
  }, [cart, user?.id]);

  // Save Products
  useEffect(() => {
    localStorage.setItem('kstores_products_v3', JSON.stringify(products));
  }, [products]);

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    sounds.playAddToCart();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast('success', language === 'te' ? 'కార్ట్‌కు చేర్చబడింది' : 'Added to cart', `${product.nameEn} (x${quantity})`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    sounds.playItemRemoved();
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartDiscount = cart.reduce((sum, item) => {
    const savings = Math.max(0, (item.product.mrp || item.product.price) - item.product.price);
    return sum + (savings * item.quantity);
  }, 0);

  const minOrderForFreeDelivery = 199;
  const deliveryFee = deliveryType === 'delivery_20min' ? (cartSubtotal >= minOrderForFreeDelivery ? 0 : 15) : 0;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order Placement
  const placeOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address?: any;
    notes?: string;
    paymentMethod: any;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
  }): Promise<Order> => {
    const newOrder: Order = {
      id: `MK-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      totalAmount: cartTotal,
      subtotal: cartSubtotal,
      deliveryFee,
      discount: cartDiscount,
      status: 'pending',
      deliveryType: orderData.deliveryType,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod,
      razorpayPaymentId: orderData.razorpayPaymentId,
      razorpayOrderId: orderData.razorpayOrderId,
      createdAt: new Date().toISOString(),
    };

    // Instant local save
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    setIsTrackingOpen(true);
    sounds.playOrderSuccess();

    // Push to Firebase Realtime Database
    await pushOrderToCloud(newOrder);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
    await updateOrderStatusInCloud(orderId, status);
  };

  const refreshOrdersFromCloud = async () => {
    // Realtime listener automatically keeps orders refreshed
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        cartItemsCount,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        minOrderForFreeDelivery,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        updateOrderStatus,
        refreshOrdersFromCloud,
        user,
        setUser,
        language,
        setLanguage,
        t,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthOpen,
        setIsAuthOpen,
        isHistoryOpen,
        setIsHistoryOpen,
        isOwnerMode,
        setIsOwnerMode,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        isSupportOpen,
        setIsSupportOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
