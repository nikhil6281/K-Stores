import { saveCloudProduct, deleteCloudProduct, fetchCloudProducts } from '../services/cloudSync';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Product, CartItem, Order, OrderStatus, DeliveryType, DeliveryAddress, CustomerUser, StoreDeal, ToastMessage, Language } from '../types';
import { initialProducts } from '../data/initialProducts';
import { translations } from '../i18n/translations';
import { sounds } from '../utils/sound';
import { fetchCloudStoreData, addOrderToCloud, updateCloudOrderStatus, onBroadcastOrderUpdate } from '../services/cloudSync';

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Products
  products: Product[];
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  resetInventory: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartItemsCount: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  deliveryFee: number;
  minOrderForFreeDelivery: number;

  // Orders
  orders: Order[];
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address?: DeliveryAddress;
    notes?: string;
    paymentMethod?: 'cash_on_delivery' | 'pay_on_pickup' | 'online_razorpay';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  reorder: (order: Order) => void;
  activeOrder: Order | null;
  setActiveOrderId: (id: string | null) => void;
  refreshOrdersFromCloud: () => Promise<void>;

  // User & Owner Auth
  user: CustomerUser | null;
  setUser: (user: CustomerUser | null) => void;
  isOwnerMode: boolean;
  setIsOwnerMode: (val: boolean) => void;

  // Modals & Drawers state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderSuccessOpen: boolean;
  setIsOrderSuccessOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Deals
  deals: StoreDeal[];
  toggleDeal: (id: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS = 'kstores_products_v2';
const LOCAL_STORAGE_ORDERS = 'kstores_orders_v2';
const LOCAL_STORAGE_CART = 'kstores_cart_v2';
const LOCAL_STORAGE_USER = 'kstores_user_v2';
const LOCAL_STORAGE_LANG = 'kstores_lang_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_LANG) as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_LANG, lang);
  };

  const t = translations[language];

  // User state
  const [user, setUserState] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    // If user is currently saved, check their user-specific cart first
    const savedUserStr = localStorage.getItem(LOCAL_STORAGE_USER);
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.phone) {
          const userCart = localStorage.getItem(`kstores_cart_user_${u.phone}`);
          if (userCart) return JSON.parse(userCart);
        }
      } catch {
        // Fallback
      }
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    if (user && user.phone) {
      localStorage.setItem(`kstores_cart_user_${user.phone}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Handle Login and Logout with Cart Continuity
  const setUser = (newUser: CustomerUser | null) => {
    if (newUser) {
      // Save user to active storage
      localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(newUser));
      setUserState(newUser);

      // Check if user has a previously saved cart from prior session
      const savedUserCartKey = `kstores_cart_user_${newUser.phone}`;
      const savedUserCartStr = localStorage.getItem(savedUserCartKey);

      if (savedUserCartStr) {
        try {
          const savedItems: CartItem[] = JSON.parse(savedUserCartStr);
          if (Array.isArray(savedItems) && savedItems.length > 0) {
            // Merge with current guest cart without duplicates
            setCart(prev => {
              const itemMap = new Map<string, CartItem>();
              savedItems.forEach(item => itemMap.set(item.product.id, item));
              prev.forEach(item => {
                if (itemMap.has(item.product.id)) {
                  const existing = itemMap.get(item.product.id)!;
                  itemMap.set(item.product.id, {
                    ...existing,
                    quantity: Math.max(existing.quantity, item.quantity)
                  });
                } else {
                  itemMap.set(item.product.id, item);
                }
              });
              return Array.from(itemMap.values());
            });
          }
        } catch {
          // Ignore
        }
      }
    } else {
      // User is logging out: save their cart first before clearing session
      if (user && user.phone) {
        localStorage.setItem(`kstores_cart_user_${user.phone}`, JSON.stringify(cart));
      }
      localStorage.removeItem(LOCAL_STORAGE_USER);
      setUserState(null);
      setCart([]);
    }
  };

  // Delivery Mode
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery_20min');

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Owner state
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(false);

  // Active tracked order
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Deals
  const [deals, setDeals] = useState<StoreDeal[]>([
    {
      id: 'deal-1',
      titleEn: 'Village Welcome Offer',
      titleTe: 'à°—à±à°°à°¾à°® à°ªà±à°°à°œà°²à°•à± à°¸à±à°µà°¾à°—à°¤à°‚ à°†à°«à°°à±',
      subtitleEn: 'Free 20-min delivery on orders above â‚¹199',
      subtitleTe: 'â‚¹199 à°ªà±ˆà°¨ à°†à°°à±à°¡à°°à±à°²à°•à± à°‰à°šà°¿à°¤ 20 à°¨à°¿à°®à°¿à°·à°¾à°² à°¡à±†à°²à°¿à°µà°°à±€',
      code: 'GRAMA20',
      discountAmount: 15,
      minOrder: 199,
      active: true
    },
    {
      id: 'deal-2',
      titleEn: 'Fresh Farm Tuesday',
      titleTe: 'à°¤à°¾à°œà°¾ à°•à±‚à°°à°—à°¾à°¯à°² à°ªà±à°°à°¤à±à°¯à±‡à°• à°¡à±€à°²à±',
      subtitleEn: 'Extra â‚¹20 off on vegetable baskets above â‚¹299',
      subtitleTe: 'à°•à±‚à°°à°—à°¾à°¯à°²à°ªà±ˆ â‚¹299 à°ªà±ˆà°¨ â‚¹20 à°¤à°—à±à°—à°¿à°‚à°ªà±',
      code: 'FARM20',
      discountAmount: 20,
      minOrder: 299,
      active: true
    }
  ]);

  const toggleDeal = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  // Modal / UI visibility states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Search & category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Keep track of order count for audio alert triggers
  const prevOrdersCountRef = useRef<number>(orders.length);
  const isOwnerModeRef = useRef<boolean>(isOwnerMode);
  
  useEffect(() => {
    isOwnerModeRef.current = isOwnerMode;
  }, [isOwnerMode]);

  // Cloud Sync: Fetch latest orders from shared online cloud database
  const refreshOrdersFromCloud = useCallback(async () => {
    const cloudData = await fetchCloudStoreData();
    if (cloudData && Array.isArray(cloudData.orders)) {
      setOrders(prev => {
        const cloudOrderMap = new Map<string, Order>();
        
        // Add cloud orders safely
        cloudData.orders.forEach(o => {
          if (o && o.id) cloudOrderMap.set(o.id, o);
        });
        
        // Add any local pending orders not yet in cloud
        prev.forEach(o => {
          if (o && o.id && !cloudOrderMap.has(o.id)) {
            cloudOrderMap.set(o.id, o);
          }
        });

        const mergedOrders = Array.from(cloudOrderMap.values()).sort(
          (a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          }
        );

        // If new orders arrived and count increased
        if (mergedOrders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
          const newestOrder = mergedOrders[0];
          if (isOwnerModeRef.current && newestOrder) {
            sounds.playOwnerNewOrderAlert();
            showToast(
              'success',
              'ðŸ”” New Live Customer Order!',
              `Order #${newestOrder.id} for â‚¹${newestOrder.totalAmount} from ${newestOrder.customerName}`
            );
          }
        }

        prevOrdersCountRef.current = mergedOrders.length;
        return mergedOrders;
      });
    }
  }, [showToast]);

  // Initial cloud sync & continuous background live polling (every 4s in owner mode, 10s otherwise)
  useEffect(() => {
    refreshOrdersFromCloud();
    const interval = setInterval(() => {
      refreshOrdersFromCloud();
    }, isOwnerMode ? 4000 : 10_000);
    return () => clearInterval(interval);
  }, [isOwnerMode, refreshOrdersFromCloud]);

  // BroadcastChannel: instant cross-tab sync on the same device (no API calls needed)
  useEffect(() => {
    const unsubscribe = onBroadcastOrderUpdate((incomingOrders) => {
      if (Array.isArray(incomingOrders) && incomingOrders.length > 0) {
        setOrders(prev => {
          const orderMap = new Map<string, Order>();
          incomingOrders.forEach(o => { if (o?.id) orderMap.set(o.id, o); });
          prev.forEach(o => { if (o?.id && !orderMap.has(o.id)) orderMap.set(o.id, o); });

          const merged = Array.from(orderMap.values()).sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          });

          if (merged.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
            if (isOwnerModeRef.current) {
              sounds.playOwnerNewOrderAlert();
              const newest = merged[0];
              if (newest) {
                showToast('success', 'ðŸ”” New Order!', `Order #${newest.id} â€” â‚¹${newest.totalAmount} from ${newest.customerName}`);
              }
            }
          }
          prevOrdersCountRef.current = merged.length;
          return merged;
        });
      }
    });
    return unsubscribe;
  }, [showToast]);

  // localStorage 'storage' event: cross-tab sync fallback for browsers without BroadcastChannel
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kstores_cloud_orders_cache' && e.newValue) {
        try {
          const orders = JSON.parse(e.newValue);
          if (Array.isArray(orders)) {
            setOrders(prev => {
              const orderMap = new Map<string, Order>();
              orders.forEach((o: Order) => { if (o?.id) orderMap.set(o.id, o); });
              prev.forEach(o => { if (o?.id && !orderMap.has(o.id)) orderMap.set(o.id, o); });
              return Array.from(orderMap.values()).sort((a, b) => {
                const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return tB - tA;
              });
            });
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Trigger immediate refresh when entering owner mode
  useEffect(() => {
    if (isOwnerMode) {
      refreshOrdersFromCloud();
    }
  }, [isOwnerMode, refreshOrdersFromCloud]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item?.product?.price ?? 0) * (item?.quantity ?? 1)), 0);
  const cartMrpTotal = cart.reduce((sum, item) => sum + ((item?.product?.mrp ?? 0) * (item?.quantity ?? 1)), 0);
  const cartDiscount = Math.max(0, cartMrpTotal - cartSubtotal);
  const cartItemsCount = cart.reduce((sum, item) => sum + (item?.quantity ?? 1), 0);
  
  const minOrderForFreeDelivery = 199;
  const deliveryFee = (deliveryType === 'store_pickup' || cartSubtotal >= minOrderForFreeDelivery || cartSubtotal === 0) ? 0 : 15;
  const cartTotal = cartSubtotal + deliveryFee;

  // Cart Actions
  const addToCart = (product: Product) => {
    if (!product || product.stock <= 0) {
      showToast('warning', language === 'te' ? 'à°¸à±à°Ÿà°¾à°•à± à°²à±‡à°¦à±' : 'Out of Stock', language === 'te' ? 'à°ˆ à°µà°¸à±à°¤à±à°µà± à°ªà±à°°à°¸à±à°¤à±à°¤à°‚ à°…à°‚à°¦à±à°¬à°¾à°Ÿà±à°²à±‹ à°²à±‡à°¦à±' : 'This item is currently out of stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item?.product?.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('warning', language === 'te' ? 'à°¸à±à°Ÿà°¾à°•à± à°ªà°°à°¿à°®à°¿à°¤à°¿' : 'Max Stock Reached', language === 'te' ? `à°•à±‡à°µà°²à°‚ ${product.stock} à°®à°¾à°¤à±à°°à°®à±‡ à°…à°‚à°¦à±à°¬à°¾à°Ÿà±à°²à±‹ à°‰à°¨à±à°¨à°¾à°¯à°¿` : `Only ${product.stock} available in store`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    sounds.playCartAdd();
    showToast('success', language === 'te' ? 'à°•à°¾à°°à±à°Ÿà±â€Œà°•à± à°šà±‡à°°à±à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Added to Cart', `${language === 'te' ? (product.nameTe || product.nameEn) : product.nameEn} x 1`, 2000);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item?.product?.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      showToast('warning', language === 'te' ? 'à°¸à±à°Ÿà°¾à°•à± à°ªà°°à°¿à°®à°¿à°¤à°¿' : 'Stock Limit', `${language === 'te' ? 'à°¸à±à°Ÿà°¾à°•à± à°¨à°¿à°²à±à°µ' : 'Available stock'}: ${product.stock}`);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (user && user.phone) {
      localStorage.removeItem(`kstores_cart_user_${user.phone}`);
    }
  };

  // Inventory Actions
  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('success', language === 'te' ? 'à°¸à°µà°°à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Product Updated', language === 'te' ? 'à°µà°¸à±à°¤à±à°µà± à°µà°¿à°µà°°à°¾à°²à± à°¨à°µà±€à°•à°°à°¿à°‚à°šà°¬à°¡à±à°¡à°¾à°¯à°¿' : 'Product updated successfully');
  };

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]); saveCloudProduct(newProduct);
    showToast('success', language === 'te' ? 'à°•à±Šà°¤à±à°¤ à°µà°¸à±à°¤à±à°µà± à°šà±‡à°°à±à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Product Added', language === 'te' ? 'à°•à±Šà°¤à±à°¤ à°µà°¸à±à°¤à±à°µà± à°¸à±à°Ÿà°¾à°•à±â€Œà°²à±‹ à°šà±‡à°°à°¿à°‚à°¦à°¿' : 'New product added to inventory');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    removeFromCart(productId);
    showToast('info', language === 'te' ? 'à°¤à±Šà°²à°—à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Deleted', language === 'te' ? 'à°µà°¸à±à°¤à±à°µà± à°¤à±Šà°²à°—à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Product removed from catalog');
  };

  const resetInventory = () => {
    setProducts(initialProducts);
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(initialProducts));
    showToast('success', 'Reset Done', 'Inventory restored to default village catalog');
  };

  // Order Placement with Live Cloud Sync
  const placeOrder = async ({
    customerName,
    customerPhone,
    deliveryType,
    address,
    notes,
    paymentMethod,
    razorpayPaymentId,
    razorpayOrderId
  }: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address?: DeliveryAddress;
    notes?: string;
    paymentMethod?: 'cash_on_delivery' | 'pay_on_pickup' | 'online_razorpay';
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
  }): Promise<Order> => {
    const orderId = `MK-${Math.floor(100000 + Math.random() * 900000)}`;
    const resolvedPaymentMethod = paymentMethod || (deliveryType === 'store_pickup' ? 'pay_on_pickup' : 'cash_on_delivery');
    
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      customerName,
      customerPhone,
      deliveryType,
      address,
      notes,
      paymentMethod: resolvedPaymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
      paymentVerified: !!razorpayPaymentId,
      status: 'pending',
      subtotal: cartSubtotal,
      deliveryFee,
      totalDiscount: cartDiscount,
      totalAmount: cartTotal,
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: deliveryType === 'delivery_20min' ? 20 : 5,
    };

    // 1. Deduct stock for ordered items
    setProducts(prev =>
      prev.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    // 2. Save order locally
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);

    sounds.playOrderSuccess();

    // 3. Push to shared central Cloud Database so ALL devices see it!
    try {
      const updatedList = await addOrderToCloud(newOrder);
      if (updatedList && updatedList.length > 0) {
        setOrders(updatedList);
      }
    } catch (err) {
      console.error('Background cloud sync error:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // 1. Update local state
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    sounds.playStatusUpdate();

    // 2. Update shared Cloud Database so customer device sees live delivery progress!
    try {
      await updateCloudOrderStatus(orderId, status);
    } catch (err) {
      console.error('Error syncing status update to cloud:', err);
    }

    const statusMapEn: Record<OrderStatus, string> = {
      pending: 'Order Confirmed',
      packing: 'Packing Groceries in Store',
      out_for_delivery: 'Out for 20-Min Delivery ðŸ›µ',
      delivered: 'Order Delivered Successfully âœ…',
      cancelled: 'Order Cancelled'
    };

    const statusMapTe: Record<OrderStatus, string> = {
      pending: 'à°†à°°à±à°¡à°°à± à°•à°¨à±à°«à°°à±à°®à± à°…à°¯à°¿à°‚à°¦à°¿',
      packing: 'à°¸à°°à±à°•à±à°²à± à°ªà±à°¯à°¾à°•à°¿à°‚à°—à± à°…à°µà±à°¤à±à°¨à±à°¨à°¾à°¯à°¿',
      out_for_delivery: 'à°¡à±†à°²à°¿à°µà°°à±€ à°¬à°¯à°²à±à°¦à±‡à°°à°¿à°‚à°¦à°¿ ðŸ›µ',
      delivered: 'à°¡à±†à°²à°¿à°µà°°à±€ à°ªà±‚à°°à±à°¤à°¯à°¿à°‚à°¦à°¿ âœ…',
      cancelled: 'à°†à°°à±à°¡à°°à± à°°à°¦à±à°¦à± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿'
    };

    showToast(
      status === 'delivered' ? 'success' : 'info',
      language === 'te' ? 'à°†à°°à±à°¡à°°à± à°…à°ªà±â€Œà°¡à±‡à°Ÿà±' : 'Order Update',
      `Order #${orderId}: ${language === 'te' ? statusMapTe[status] : statusMapEn[status]}`
    );
  };

  const reorder = (pastOrder: Order) => {
    if (!pastOrder || !Array.isArray(pastOrder.items)) return;
    pastOrder.items.forEach(item => {
      if (!item || !item.product) return;
      const currentProduct = products.find(p => p.id === item.product.id);
      if (currentProduct && currentProduct.stock > 0) {
        addToCart(currentProduct);
      }
    });
    setIsHistoryOpen(false);
    setIsTrackingOpen(false);
    setIsCartOpen(true);
    showToast('success', language === 'te' ? 'à°µà°¸à±à°¤à±à°µà±à°²à± à°šà±‡à°°à±à°šà°¬à°¡à±à°¡à°¾à°¯à°¿' : 'Items Reordered', language === 'te' ? 'à°—à°¤ à°†à°°à±à°¡à°°à± à°µà°¸à±à°¤à±à°µà±à°²à± à°•à°¾à°°à±à°Ÿà±â€Œà°•à± à°šà±‡à°°à°¾à°¯à°¿' : 'Previous order items added to cart');
  };

  const activeOrder = orders.find(o => o?.id === activeOrderId) || orders[0] || null;

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        t,

        products,
        updateProduct,
        addProduct,
        deleteProduct,
        resetInventory,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
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
        placeOrder,
        updateOrderStatus,
        reorder,
        activeOrder,
        setActiveOrderId,
        refreshOrdersFromCloud,

        user,
        setUser,
        isOwnerMode,
        setIsOwnerMode,

        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        isHistoryOpen,
        setIsHistoryOpen,
        isSupportOpen,
        setIsSupportOpen,
        isAuthOpen,
        setIsAuthOpen,
        isAdminLoginOpen,
        setIsAdminLoginOpen,

        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,

        deals,
        toggleDeal,

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
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};




