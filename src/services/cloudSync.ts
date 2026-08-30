import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';
import type { Order, OrderStatus } from '../types';
import { firebaseConfig } from './firebaseSync';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Secondary Universal Cloud Database Endpoint (Zero-fail backup)
const BACKUP_CLOUD_URL = 'https://extendsclass.com/api/json-storage/bin/fbcdbcf';
const LOCAL_STORAGE_KEY = 'kstores_orders_list';

// BroadcastChannel for instant same-browser sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('kstores_dual_cloud_sync');
  }
} catch {}

/**
 * Fetch orders from Firebase (Primary) + Cloud REST (Backup)
 */
export async function fetchCloudStoreData(): Promise<{ orders: Order[]; lastUpdated?: string }> {
  let combinedOrders: Order[] = [];
  const orderMap = new Map<string, Order>();

  // 1. Fetch from Firebase Realtime Database
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.values(data).forEach((o: any) => {
        if (o && o.id) orderMap.set(o.id, o);
      });
    }
  } catch (err) {
    console.warn('[Firebase] Read warning, using REST fallback:', err);
  }

  // 2. Fetch from Backup Cloud REST
  try {
    const response = await fetch(BACKUP_CLOUD_URL, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.orders)) {
        data.orders.forEach((o: any) => {
          if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
        });
      }
    }
  } catch {}

  // 3. Fallback to Local Cache if offline
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      JSON.parse(cached).forEach((o: any) => {
        if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
      });
    }
  } catch {}

  combinedOrders = Array.from(orderMap.values());
  combinedOrders.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combinedOrders));
  } catch {}

  return { orders: combinedOrders, lastUpdated: new Date().toISOString() };
}

/**
 * Add / Push Order to Both Cloud Databases Simultaneously
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  // Push to Firebase
  try {
    const orderRef = ref(db, `orders/${newOrder.id}`);
    await set(orderRef, newOrder);
  } catch (err) {
    console.warn('[Firebase] Write error:', err);
  }

  // Push to Cloud Backup REST
  try {
    const current = await fetchCloudStoreData();
    const updated = [newOrder, ...current.orders.filter(o => o.id !== newOrder.id)];
    await fetch(BACKUP_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated, lastUpdated: new Date().toISOString() })
    });
  } catch {}

  broadcastOrders([newOrder]);
  const { orders } = await fetchCloudStoreData();
  return orders;
}

/**
 * Update Order Status Across Cloud
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, { status, updatedAt: new Date().toISOString() });
  } catch {}

  try {
    const current = await fetchCloudStoreData();
    const updated = current.orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o);
    await fetch(BACKUP_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated, lastUpdated: new Date().toISOString() })
    });
  } catch {}

  return true;
}

/**
 * Real-time Listener for Instant Order Updates
 */
export function onBroadcastOrderUpdate(callback: (orders: Order[]) => void): () => void {
  try {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList: Order[] = Object.values(data);
        ordersList.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        callback(ordersList);
      }
    });
    return () => unsubscribe();
  } catch {
    return () => {};
  }
}

export function broadcastOrders(orders: Order[]): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(orders);
    } catch {}
  }
}
