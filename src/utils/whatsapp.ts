import type { Order } from '../types';

export const STORE_OWNER_PHONE = '916281730144';
export const STORE_OWNER_DISPLAY_PHONE = '+91 62817 30144';
export const STORE_NAME = 'K-Stores (à°•à±†-à°¸à±à°Ÿà±‹à°°à±à°¸à±)';

/**
 * Format a detailed, beautiful itemized grocery bill for WhatsApp
 */
export function formatWhatsAppOrderBill(order: Order, language: 'en' | 'te' = 'en'): string {
  const isTe = language === 'te';
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const orderDate = new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

  const isDelivery = order.deliveryType === 'delivery_20min';

  let message = `ðŸ›’ *${STORE_NAME} - ${isTe ? 'à°•à±Šà°¤à±à°¤ à°†à°°à±à°¡à°°à± à°¬à°¿à°²à±à°²à±' : 'NEW ORDER BILL'}*\n`;
  message += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`;
  message += `ðŸ“‹ *${isTe ? 'à°†à°°à±à°¡à°°à± ID' : 'Order ID'}:* #${order.id}\n`;
  message += `ðŸ•’ *${isTe ? 'à°¸à°®à°¯à°‚' : 'Date & Time'}:* ${orderDate}, ${orderTime}\n`;
  message += `âš¡ *${isTe ? 'à°¡à±†à°²à°¿à°µà°°à±€ à°°à°•à°‚' : 'Delivery Mode'}:* ${isDelivery ? (isTe ? 'ðŸš€ 20-à°¨à°¿à°®à°¿à°·à°¾à°² à°µà°¿à°²à±‡à°œà± à°¹à±‹à°®à± à°¡à±†à°²à°¿à°µà°°à±€' : 'ðŸš€ 20-Min Doorstep Delivery') : (isTe ? 'ðŸª à°·à°¾à°ªà± à°•à±Œà°‚à°Ÿà°°à± à°µà°¦à±à°¦ à°ªà°¿à°•à°ªà±' : 'ðŸª Store Counter Pickup')}\n\n`;

  message += `ðŸ‘¤ *${isTe ? 'à°•à°¸à±à°Ÿà°®à°°à± à°µà°¿à°µà°°à°¾à°²à±' : 'CUSTOMER DETAILS'}:*\n`;
  message += `â€¢ *${isTe ? 'à°ªà±‡à°°à±' : 'Name'}:* ${order.customerName}\n`;
  message += `â€¢ *${isTe ? 'à°«à±‹à°¨à±' : 'Phone'}:* +91 ${order.customerPhone}\n`;

  if (isDelivery && order.address) {
    message += `â€¢ *${isTe ? 'à°—à±à°°à°¾à°®à°‚ / à°µà±€à°§à°¿' : 'Village / Street'}:* ${order.address.villageName}\n`;
    if (order.address.doorNo) {
      message += `â€¢ *${isTe ? 'à°‡à°‚à°Ÿà°¿ à°¨à°‚à°¬à°°à±' : 'Door No'}:* ${order.address.doorNo}\n`;
    }
    if (order.address.landmark) {
      message += `â€¢ *ðŸ“ ${isTe ? 'à°²à±à°¯à°¾à°‚à°¡à±â€Œà°®à°¾à°°à±à°•à±' : 'Landmark'}:* ${order.address.landmark}\n`;
    }
  }

  if (order.notes) {
    message += `â€¢ *ðŸ“ ${isTe ? 'à°¸à±‚à°šà°¨' : 'Note'}:* ${order.notes}\n`;
  }

  message += `\nðŸ“¦ *${isTe ? 'à°†à°°à±à°¡à°°à± à°šà±‡à°¸à°¿à°¨ à°¸à°°à±à°•à±à°²à±' : 'ITEMIZED GROCERY LIST'}:*\n`;
  message += `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n`;

  order.items.forEach((item, index) => {
    const p = item.product;
    const name = isTe ? p.nameTe : p.nameEn;
    const unit = isTe ? p.unitTe : p.unit;
    const itemTotal = p.price * item.quantity;
    message += `${index + 1}. *${name}*\n`;
    message += `   â””â”€ ${item.quantity} x â‚¹${p.price} (${unit}) = *â‚¹${itemTotal}*\n`;
  });

  message += `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n`;
  message += `ðŸ’° *${isTe ? 'à°¸à°°à±à°•à±à°² à°®à±Šà°¤à±à°¤à°‚ (Subtotal)' : 'Items Subtotal'}:* â‚¹${order.subtotal}\n`;
  
  if (isDelivery) {
    message += `ðŸ›µ *${isTe ? 'à°¡à±†à°²à°¿à°µà°°à±€ à°›à°¾à°°à±à°œà±' : 'Delivery Fee'}:* ${order.deliveryFee === 0 ? (isTe ? 'à°‰à°šà°¿à°¤à°‚ (FREE)' : 'FREE') : `â‚¹${order.deliveryFee}`}\n`;
  }
  
  if (order.totalDiscount > 0) {
    message += `ðŸŽ‰ *${isTe ? 'à°®à±Šà°¤à±à°¤à°‚ à°†à°¦à°¾ (Savings)' : 'Total Savings'}:* -â‚¹${order.totalDiscount}\n`;
  }

  const paymentStr = order.paymentMethod === 'online_razorpay'
    ? (isTe ? `à°†à°¨à±â€Œà°²à±ˆà°¨à± à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°ªà±‚à°°à±à°¤à°¯à°¿à°‚à°¦à°¿ âœ… (Razorpay ID: ${order.razorpayPaymentId || 'PAID'})` : `PAID ONLINE via Razorpay âœ… (ID: ${order.razorpayPaymentId || 'PAID'})`)
    : order.paymentMethod === 'pay_on_pickup'
    ? (isTe ? 'à°¸à±à°Ÿà±‹à°°à± à°•à±Œà°‚à°Ÿà°°à±â€Œà°²à±‹ à°šà±†à°²à±à°²à°¿à°‚à°ªà± (Pay on Pickup)' : 'Pay on Pickup at Store')
    : (isTe ? 'à°•à±à°¯à°¾à°·à± à°†à°¨à± à°¡à±†à°²à°¿à°µà°°à±€ / UPI (COD)' : 'Cash on Delivery / UPI (COD)');

  message += `\nðŸ’µ *${isTe ? 'à°®à±Šà°¤à±à°¤à°‚ à°¬à°¿à°²à±à°²à± (TOTAL BILL)' : 'TOTAL BILL'}:* *â‚¹${order.totalAmount}*\n`;
  message += `ðŸ’³ *${isTe ? 'à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°µà°¿à°µà°°à°¾à°²à±' : 'Payment'}:* *${paymentStr}*\n`;
  message += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n`;
  message += isTe 
    ? `ðŸ™ *à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±! à°¦à°¯à°šà±‡à°¸à°¿ à°†à°°à±à°¡à°°à±â€Œà°¨à± 20 à°¨à°¿à°®à°¿à°·à°¾à°²à±à°²à±‹ à°¡à±†à°²à°¿à°µà°°à±€ à°šà±‡à°¯à°—à°²à°°à±.*` 
    : `ðŸ™ *Thank you! Please process and deliver within 20 minutes.*`;

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
    ? 'à°¨à°®à°¸à±à°•à°¾à°°à°‚! à°•à±†-à°¸à±à°Ÿà±‹à°°à±à°¸à± à°·à°¾à°ªà± à°†à°°à±à°¡à°°à± à°²à±‡à°¦à°¾ à°¸à°°à±à°•à±à°² à°—à±à°°à°¿à°‚à°šà°¿ à°¸à°¹à°¾à°¯à°‚ à°•à°¾à°µà°¾à°²à°¿.'
    : 'Hello! I need assistance with my K-Stores order or grocery inquiry.';
  return `https://wa.me/${STORE_OWNER_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp URI for store owner to notify customer of status updates
 */
export function getCustomerStatusUpdateWhatsAppUrl(order: Order, statusText: string): string {
  const cleanPhone = order.customerPhone.replace(/\D/g, '');
  const message = `ðŸ‘‹ Hello ${order.customerName},\n\nYour K-Stores order *#${order.id}* status update: *${statusText}*.\n\nTotal to Pay: â‚¹${order.totalAmount} (Cash on Delivery).\nEstimated Time: ~${order.estimatedDeliveryMinutes} mins.\n\nThank you for choosing K-Stores!`;
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}

