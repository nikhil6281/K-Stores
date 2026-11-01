const fs = require('fs');

let content = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldCod = `    try {
      await placeOrder({
        customerName: fullName,
        customerPhone: cleanPhone,
        deliveryType,
        address,
        notes: notes.trim() || undefined,
        paymentMethod: deliveryType === 'store_pickup' ? 'pay_on_pickup' : 'cash_on_delivery',
      });
    } finally {
      setIsSubmitting(false);
    }`;

const newCod = `    try {
      await placeOrder({
        customerName: fullName,
        customerPhone: cleanPhone,
        deliveryType,
        address,
        notes: notes.trim() || undefined,
        paymentMethod: deliveryType === 'store_pickup' ? 'pay_on_pickup' : 'cash_on_delivery',
      });
    } catch (err: any) {
      alert('Order Placement Error: ' + (err?.message || err));
      showToast('error', 'Order Error', err?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }`;

if (content.includes(oldCod)) {
  content = content.replace(oldCod, newCod);
}

fs.writeFileSync('src/components/CheckoutModal.tsx', content, 'utf8');
console.log('src/components/CheckoutModal.tsx updated');
