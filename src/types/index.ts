export type Language = 'en' | 'te';
export type DeliveryType = 'delivery_20min' | 'store_pickup';
export type OrderStatus = 'pending' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'pay_on_pickup' | 'online_razorpay' | 'upi_direct';
export type ProductCategory = 'all' | 'vegetables' | 'fruits' | 'dairy' | 'staples' | 'snacks' | 'spices' | 'beverages' | 'household' | 'personal_care' | 'pooja';

export interface Product {
  id: string;
  nameEn: string;
  nameTe: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  unit: string;
  unitTe: string;
  image: string;
  stock: number;
  minStockAlert: number;
  isVeg: boolean;
  isDeal?: boolean;
  descriptionEn?: string;
  descriptionTe?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  villageName: string;
  doorNo?: string;
  landmark: string;
  pincode?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  savedAddress?: DeliveryAddress;
  joinedAt: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerEmail?: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  address?: DeliveryAddress;
  notes?: string;
  paymentMethod: PaymentMethod;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
