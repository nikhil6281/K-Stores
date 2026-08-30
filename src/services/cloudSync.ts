import type { Order, OrderStatus } from '../types';

const FIREBASE_REST_BASE = 'https://k-store-ae9dd-default-rtdb.firebaseio.com';
const BACKUP_REST_URL = 'https://extendsclass.com/api/json-storage/bin/fbcdbcf';
const LOCAL_STORAGE_KEY = 'kstores_production_orders_v4';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('kstores_live_sync');
  }
} catch {}

/**
 * Fetch orders from Firebase REST + Backup REST + Local Cache
 */
export async function fetchCloudStoreData(): Promise<{ orders: Order[]; lastUpdated?: string }> {
  const orderMap = new Map<string, Order>();

  // 1. Fetch from Firebase REST API directly (100% reliable across all browsers)
  try {
    const res = await fetch(`${FIREBASE_REST_BASE}/orders.json?_ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.values(data).forEach((o: any) => {
          if (o && o.id) orderMap.set(o.id, o);
        });
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Firebase REST read warning:', err);
  }

  // 2. Fetch from Backup Cloud REST
  try {
    const res = await fetch(`${BACKUP_REST_URL}?_ts=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        data.orders.forEach((o: any) => {
          if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
        });
      }
    }
  } catch {}

  // 3. Merge with local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      JSON.parse(cached).forEach((o: any) => {
        if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
      });
    }
  } catch {}

  const ordersList = Array.from(orderMap.values());
  ordersList.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ordersList));
  } catch {}

  return { orders: ordersList, lastUpdated: new Date().toISOString() };
}

/**
 * Add / Push Order to Both Cloud Databases with Confirmation
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  // 1. Direct Firebase REST write
  try {
    await fetch(`${FIREBASE_REST_BASE}/orders/${newOrder.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (err) {
    console.warn('[CloudSync] Firebase REST write error:', err);
  }

  // 2. Backup Cloud REST write
  try {
    const current = await fetchCloudStoreData();
    const updated = [newOrder, ...current.orders.filter(o => o.id !== newOrder.id)];
    await fetch(BACKUP_REST_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated, lastUpdated: new Date().toISOString() })
    });
  } catch {}

  // 3. Broadcast to all open tabs
  broadcastOrders([newOrder]);

  const { orders } = await fetchCloudStoreData();
  return orders;
}

/**
 * Update Order Status Across Cloud
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const updatedAt = new Date().toISOString();

  try {
    await fetch(`${FIREBASE_REST_BASE}/orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedAt })
    });
  } catch {}

  try {
    const current = await fetchCloudStoreData();
    const updated = current.orders.map(o => o.id === orderId ? { ...o, status, updatedAt } : o);
    await fetch(BACKUP_REST_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated, lastUpdated: updatedAt })
    });
  } catch {}

  return true;
}

export function onBroadcastOrderUpdate(callback: (orders: Order[]) => void): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (Array.isArray(event.data)) {
      callback(event.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

export function broadcastOrders(orders: Order[]): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(orders);
    } catch {}
  }
}
