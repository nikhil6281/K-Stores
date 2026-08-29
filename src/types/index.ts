export type Language = 'en' | 'te';

export type ProductCategory = 
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'staples'
  | 'snacks'
  | 'spices'
  | 'beverages'
  | 'household'
  | 'personal_care'
  | 'pooja';

export interface Product {
  id: string;
  nameEn: string;
  nameTe: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  unit: string;
  unitTe: string;
  stock: number;
  minStockAlert: number;
  image: string;
  isDeal?: boolean;
  dealTagEn?: string;
  dealTagTe?: string;
  isVeg: boolean;
  descriptionEn?: string;
  descriptionTe?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type DeliveryType = 'delivery_20min' | 'store_pickup';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  villageName: string;
  streetName?: string;
  doorNo?: string;
  landmark: string;
  pincode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: DeliveryAddress;
  paymentMethod: 'cash_on_delivery' | 'pay_on_pickup';
  notes?: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalDiscount: number;
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryMinutes: number;
  whatsappSent?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedAddress?: DeliveryAddress;
  joinedAt: string;
}

export interface StoreDeal {
  id: string;
  titleEn: string;
  titleTe: string;
  subtitleEn: string;
  subtitleTe: string;
  code: string;
  discountAmount: number;
  minOrder: number;
  active: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}
