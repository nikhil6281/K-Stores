const fs = require('fs');

// 1. Update src/types/index.ts to include uid?: string in Order
let typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
if (!typesContent.includes('uid?: string;')) {
  typesContent = typesContent.replace('export interface Order {', 'export interface Order {\n  uid?: string;');
  fs.writeFileSync('src/types/index.ts', typesContent, 'utf8');
  console.log('src/types/index.ts updated with uid?: string');
}

// 2. Update src/context/StoreContext.tsx
let ctxContent = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

// Add imports
if (!ctxContent.includes('pushOrderToCloud')) {
  ctxContent = ctxContent.replace(
    "import { fetchCloudStoreData, addOrderToCloud, updateCloudOrderStatus, onBroadcastOrderUpdate } from '../services/cloudSync';",
    "import { fetchCloudStoreData, addOrderToCloud, updateCloudOrderStatus, onBroadcastOrderUpdate } from '../services/cloudSync';\nimport { pushOrderToCloud, auth } from '../services/firebaseSync';"
  );
}

// Update placeOrder
const targetOldPlaceOrder = `    const newOrder: Order = {
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
    };`;

const targetNewPlaceOrder = `    const currentUid = user?.id || auth.currentUser?.uid || 'guest';
    const newOrder: Order = {
      id: orderId,
      uid: currentUid,
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
    };`;

const targetOldSync = `    // 3. Push to shared central Cloud Database so ALL devices see it!
    try {
      const updatedList = await addOrderToCloud(newOrder);
      if (updatedList && updatedList.length > 0) {
        setOrders(updatedList);
      }
    } catch (err) {
      console.error('Background cloud sync error:', err);
    }`;

const targetNewSync = `    // 3. Push to Firebase Realtime Database and Cloud Sync
    try {
      await pushOrderToCloud(newOrder);
      const updatedList = await addOrderToCloud(newOrder);
      if (updatedList && updatedList.length > 0) {
        setOrders(updatedList);
      }
    } catch (err: any) {
      console.error('[StoreContext] Order placement error:', err);
      // Surface immediately on mobile to diagnose permissions or network disconnects
      alert('Order Placement Notice: ' + (err?.message || 'Database connection error.'));
      throw err;
    }`;

ctxContent = ctxContent.replace(/\r\n/g, '\n');
if (ctxContent.includes(targetOldPlaceOrder)) {
  ctxContent = ctxContent.replace(targetOldPlaceOrder, targetNewPlaceOrder);
}
if (ctxContent.includes(targetOldSync)) {
  ctxContent = ctxContent.replace(targetOldSync, targetNewSync);
}

fs.writeFileSync('src/context/StoreContext.tsx', ctxContent, 'utf8');
console.log('src/context/StoreContext.tsx updated');
