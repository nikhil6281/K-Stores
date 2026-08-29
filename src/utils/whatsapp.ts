import type { Order } from '../types';

export const STORE_OWNER_PHONE = '916281730144';
export const STORE_OWNER_DISPLAY_PHONE = '+91 62817 30144';
export const STORE_NAME = 'K-Stores (కె-స్టోర్స్)';

/**
 * Format a detailed, beautiful itemized grocery bill for WhatsApp
 */
export function formatWhatsAppOrderBill(order: Order, language: 'en' | 'te' = 'en'): string {
  const isTe = language === 'te';
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const orderDate = new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

  const isDelivery = order.deliveryType === 'delivery_20min';

  let message = `🛒 *${STORE_NAME} - ${isTe ? 'కొత్త ఆర్డర్ బిల్లు' : 'NEW ORDER BILL'}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *${isTe ? 'ఆర్డర్ ID' : 'Order ID'}:* #${order.id}\n`;
  message += `🕒 *${isTe ? 'సమయం' : 'Date & Time'}:* ${orderDate}, ${orderTime}\n`;
  message += `⚡ *${isTe ? 'డెలివరీ రకం' : 'Delivery Mode'}:* ${isDelivery ? (isTe ? '🚀 20-నిమిషాల విలేజ్ హోమ్ డెలివరీ' : '🚀 20-Min Doorstep Delivery') : (isTe ? '🏪 షాప్ కౌంటర్ వద్ద పికప్' : '🏪 Store Counter Pickup')}\n\n`;

  message += `👤 *${isTe ? 'కస్టమర్ వివరాలు' : 'CUSTOMER DETAILS'}:*\n`;
  message += `• *${isTe ? 'పేరు' : 'Name'}:* ${order.customerName}\n`;
  message += `• *${isTe ? 'ఫోన్' : 'Phone'}:* +91 ${order.customerPhone}\n`;

  if (isDelivery && order.address) {
    message += `• *${isTe ? 'గ్రామం / వీధి' : 'Village / Street'}:* ${order.address.villageName}\n`;
    if (order.address.doorNo) {
      message += `• *${isTe ? 'ఇంటి నంబర్' : 'Door No'}:* ${order.address.doorNo}\n`;
    }
    if (order.address.landmark) {
      message += `• *📍 ${isTe ? 'ల్యాండ్‌మార్క్' : 'Landmark'}:* ${order.address.landmark}\n`;
    }
  }

  if (order.notes) {
    message += `• *📝 ${isTe ? 'సూచన' : 'Note'}:* ${order.notes}\n`;
  }

  message += `\n📦 *${isTe ? 'ఆర్డర్ చేసిన సరుకులు' : 'ITEMIZED GROCERY LIST'}:*\n`;
  message += `─────────────────────\n`;

  order.items.forEach((item, index) => {
    const p = item.product;
    const name = isTe ? p.nameTe : p.nameEn;
    const unit = isTe ? p.unitTe : p.unit;
    const itemTotal = p.price * item.quantity;
    message += `${index + 1}. *${name}*\n`;
    message += `   └─ ${item.quantity} x ₹${p.price} (${unit}) = *₹${itemTotal}*\n`;
  });

  message += `─────────────────────\n`;
  message += `💰 *${isTe ? 'సరుకుల మొత్తం (Subtotal)' : 'Items Subtotal'}:* ₹${order.subtotal}\n`;
  
  if (isDelivery) {
    message += `🛵 *${isTe ? 'డెలివరీ ఛార్జ్' : 'Delivery Fee'}:* ${order.deliveryFee === 0 ? (isTe ? 'ఉచితం (FREE)' : 'FREE') : `₹${order.deliveryFee}`}\n`;
  }
  
  if (order.totalDiscount > 0) {
    message += `🎉 *${isTe ? 'మొత్తం ఆదా (Savings)' : 'Total Savings'}:* -₹${order.totalDiscount}\n`;
  }

  const paymentStr = order.paymentMethod === 'online_razorpay'
    ? (isTe ? `ఆన్‌లైన్ చెల్లింపు పూర్తయింది ✅ (Razorpay ID: ${order.razorpayPaymentId || 'PAID'})` : `PAID ONLINE via Razorpay ✅ (ID: ${order.razorpayPaymentId || 'PAID'})`)
    : order.paymentMethod === 'pay_on_pickup'
    ? (isTe ? 'స్టోర్ కౌంటర్‌లో చెల్లింపు (Pay on Pickup)' : 'Pay on Pickup at Store')
    : (isTe ? 'క్యాష్ ఆన్ డెలివరీ / UPI (COD)' : 'Cash on Delivery / UPI (COD)');

  message += `\n💵 *${isTe ? 'మొత్తం బిల్లు (TOTAL BILL)' : 'TOTAL BILL'}:* *₹${order.totalAmount}*\n`;
  message += `💳 *${isTe ? 'చెల్లింపు వివరాలు' : 'Payment'}:* *${paymentStr}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += isTe 
    ? `🙏 *ధన్యవాదాలు! దయచేసి ఆర్డర్‌ను 20 నిమిషాల్లో డెలివరీ చేయగలరు.*` 
    : `🙏 *Thank you! Please process and deliver within 20 minutes.*`;

  return message;
}

/**
 * Generate a direct WhatsApp URI for the store owner
 */
export function getWhatsAppOrderUrl(order: Order, language: 'en' | 'te' = 'en'): string {
  const billText = formatWhatsAppOrderBill(order, language);
  const encodedText = encodeURIComponent(billText);
  return `https://wa.me/${STORE_OWNER_PHONE}?text=${encodedText}`;
}

/**
 * Generate WhatsApp URI for customer support query
 */
export function getWhatsAppSupportUrl(language: 'en' | 'te' = 'en'): string {
  const text = language === 'te' 
    ? 'నమస్కారం! కె-స్టోర్స్ షాప్ ఆర్డర్ లేదా సరుకుల గురించి సహాయం కావాలి.'
    : 'Hello! I need assistance with my K-Stores order or grocery inquiry.';
  return `https://wa.me/${STORE_OWNER_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp URI for store owner to notify customer of status updates
 */
export function getCustomerStatusUpdateWhatsAppUrl(order: Order, statusText: string): string {
  const cleanPhone = order.customerPhone.replace(/\D/g, '');
  const message = `👋 Hello ${order.customerName},\n\nYour K-Stores order *#${order.id}* status update: *${statusText}*.\n\nTotal to Pay: ₹${order.totalAmount} (Cash on Delivery).\nEstimated Time: ~${order.estimatedDeliveryMinutes} mins.\n\nThank you for choosing K-Stores!`;
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}
