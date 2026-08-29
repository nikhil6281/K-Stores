import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, Order, OrderStatus, DeliveryType, DeliveryAddress, CustomerUser, StoreDeal, ToastMessage, Language } from '../types';
import { initialProducts } from '../data/initialProducts';
import { translations } from '../i18n/translations';
import { sounds } from '../utils/sound';

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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reorder: (order: Order) => void;
  activeOrder: Order | null;
  setActiveOrderId: (id: string | null) => void;

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

const LOCAL_STORAGE_PRODUCTS = 'mana_kirana_products_v1';
const LOCAL_STORAGE_ORDERS = 'mana_kirana_orders_v1';
const LOCAL_STORAGE_CART = 'mana_kirana_cart_v1';
const LOCAL_STORAGE_USER = 'mana_kirana_user_v1';
const LOCAL_STORAGE_LANG = 'mana_kirana_lang_v1';

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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
  }, [cart]);

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

  const setUser = (newUser: CustomerUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER);
    }
  };

  // Owner state
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(false);

  // Active tracked order
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Deals
  const [deals, setDeals] = useState<StoreDeal[]>([
    {
      id: 'deal-1',
      titleEn: 'Village Welcome Offer',
      titleTe: 'గ్రామ ప్రజలకు స్వాగతం ఆఫర్',
      subtitleEn: 'Free 20-min delivery on orders above ₹199',
      subtitleTe: '₹199 పైన ఆర్డర్లకు ఉచిత 20 నిమిషాల డెలివరీ',
      code: 'GRAMA20',
      discountAmount: 15,
      minOrder: 199,
      active: true
    },
    {
      id: 'deal-2',
      titleEn: 'Fresh Farm Tuesday',
      titleTe: 'తాజా కూరగాయల ప్రత్యేక డీల్',
      subtitleEn: 'Extra ₹20 off on vegetable baskets above ₹299',
      subtitleTe: 'కూరగాయలపై ₹299 పైన ₹20 తగ్గింపు',
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

  const showToast = (type: ToastMessage['type'], title: string, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartMrpTotal = cart.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
  const cartDiscount = Math.max(0, cartMrpTotal - cartSubtotal);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const minOrderForFreeDelivery = 199;
  const deliveryFee = (deliveryType === 'store_pickup' || cartSubtotal >= minOrderForFreeDelivery || cartSubtotal === 0) ? 0 : 15;
  const cartTotal = cartSubtotal + deliveryFee;

  // Cart Actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast('warning', language === 'te' ? 'స్టాక్ లేదు' : 'Out of Stock', language === 'te' ? 'ఈ వస్తువు ప్రస్తుతం అందుబాటులో లేదు' : 'This item is currently out of stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('warning', language === 'te' ? 'స్టాక్ పరిమితి' : 'Max Stock Reached', language === 'te' ? `కేవలం ${product.stock} మాత్రమే అందుబాటులో ఉన్నాయి` : `Only ${product.stock} available in store`);
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
    showToast('success', language === 'te' ? 'కార్ట్‌కు చేర్చబడింది' : 'Added to Cart', `${language === 'te' ? product.nameTe : product.nameEn} x 1`, 2000);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      showToast('warning', language === 'te' ? 'స్టాక్ పరిమితి' : 'Stock Limit', `${language === 'te' ? 'స్టాక్ నిల్వ' : 'Available stock'}: ${product.stock}`);
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
  };

  // Inventory Actions
  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('success', language === 'te' ? 'సవరించబడింది' : 'Product Updated', language === 'te' ? 'వస్తువు వివరాలు నవీకరించబడ్డాయి' : 'Product updated successfully');
  };

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast('success', language === 'te' ? 'కొత్త వస్తువు చేర్చబడింది' : 'Product Added', language === 'te' ? 'కొత్త వస్తువు స్టాక్‌లో చేరింది' : 'New product added to inventory');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    removeFromCart(productId);
    showToast('info', language === 'te' ? 'తొలగించబడింది' : 'Deleted', language === 'te' ? 'వస్తువు తొలగించబడింది' : 'Product removed from catalog');
  };

  const resetInventory = () => {
    setProducts(initialProducts);
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(initialProducts));
    showToast('success', 'Reset Done', 'Inventory restored to default village catalog');
  };

  // Order Placement
  const placeOrder = ({
    customerName,
    customerPhone,
    deliveryType,
    address,
    notes
  }: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    address?: DeliveryAddress;
    notes?: string;
  }): Order => {
    const orderId = `MK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      customerName,
      customerPhone,
      deliveryType,
      address,
      notes,
      paymentMethod: deliveryType === 'store_pickup' ? 'pay_on_pickup' : 'cash_on_delivery',
      status: 'pending',
      subtotal: cartSubtotal,
      deliveryFee,
      totalDiscount: cartDiscount,
      totalAmount: cartTotal,
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: deliveryType === 'delivery_20min' ? 20 : 5,
    };

    // Deduct stock for ordered items
    setProducts(prev =>
      prev.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    // Save order
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);

    sounds.playOrderSuccess();

    // Auto update user details if not saved
    if (!user) {
      setUser({
        id: `user-${Date.now()}`,
        name: customerName,
        phone: customerPhone,
        savedAddress: address,
        joinedAt: new Date().toISOString()
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    sounds.playStatusUpdate();

    const statusMapEn: Record<OrderStatus, string> = {
      pending: 'Order Confirmed',
      packing: 'Packing Groceries in Store',
      out_for_delivery: 'Out for 20-Min Delivery 🛵',
      delivered: 'Order Delivered Successfully ✅',
      cancelled: 'Order Cancelled'
    };

    const statusMapTe: Record<OrderStatus, string> = {
      pending: 'ఆర్డర్ కన్ఫర్మ్ అయింది',
      packing: 'సరుకులు ప్యాకింగ్ అవుతున్నాయి',
      out_for_delivery: 'డెలివరీ బయలుదేరింది 🛵',
      delivered: 'డెలివరీ పూర్తయింది ✅',
      cancelled: 'ఆర్డర్ రద్దు చేయబడింది'
    };

    showToast(
      status === 'delivered' ? 'success' : 'info',
      language === 'te' ? 'ఆర్డర్ అప్‌డేట్' : 'Order Update',
      `Order #${orderId}: ${language === 'te' ? statusMapTe[status] : statusMapEn[status]}`
    );
  };

  const reorder = (pastOrder: Order) => {
    pastOrder.items.forEach(item => {
      const currentProduct = products.find(p => p.id === item.product.id);
      if (currentProduct && currentProduct.stock > 0) {
        addToCart(currentProduct);
      }
    });
    setIsHistoryOpen(false);
    setIsTrackingOpen(false);
    setIsCartOpen(true);
    showToast('success', language === 'te' ? 'వస్తువులు చేర్చబడ్డాయి' : 'Items Reordered', language === 'te' ? 'గత ఆర్డర్ వస్తువులు కార్ట్‌కు చేరాయి' : 'Previous order items added to cart');
  };

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;

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
