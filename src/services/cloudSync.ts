import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';
import type { Order, OrderStatus } from '../types';
import { firebaseConfig } from './firebaseSync';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function fetchCloudStoreData(): Promise<{ orders: Order[]; lastUpdated?: string }> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersList: Order[] = Object.values(data);
      ordersList.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      return { orders: ordersList, lastUpdated: new Date().toISOString() };
    }
  } catch (err) {
    console.warn('[Firebase] Read error:', err);
  }
  return { orders: [] };
}

export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  try {
    const orderRef = ref(db, `orders/${newOrder.id}`);
    await set(orderRef, newOrder);
  } catch (err) {
    console.warn('[Firebase] Write error:', err);
  }
  const { orders } = await fetchCloudStoreData();
  return orders;
}

export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, { status, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('[Firebase] Status error:', err);
    return false;
  }
}

export function onBroadcastOrderUpdate(callback: (orders: Order[]) => void): () => void {
  try {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList: Order[] = Object.values(data);
        ordersList.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        callback(ordersList);
      } else {
        callback([]);
      }
    });
    return () => unsubscribe();
  } catch {
    return () => {};
  }
}

export function broadcastOrders(_orders: Order[]): void {}
