import type { Order, OrderStatus, Product } from '../types';
import { initialProducts } from '../data/initialProducts';

const FIREBASE_REST_BASE = 'https://k-store-ae9dd-default-rtdb.firebaseio.com';
const BACKUP_REST_URL = 'https://extendsclass.com/api/json-storage/bin/fbcdbcf';
const LOCAL_STORAGE_ORDERS_KEY = 'kstores_production_orders_v4';
const LOCAL_STORAGE_PRODUCTS_KEY = 'kstores_cloud_products_v1';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('kstores_live_sync');
  }
} catch {}

// =====================================================================
// PRODUCT CLOUD SYNC (Add, Edit Price, Refill Stock, Deals, Delete)
// =====================================================================

/**
 * Fetch all products from Firebase Realtime Database.
 * If cloud is empty, seed it with initial products automatically.
 */
export async function fetchCloudProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${FIREBASE_REST_BASE}/products.json?_ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const productList: Product[] = Object.values(data);
        if (productList.length > 0) {
          localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
          return productList;
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Products fetch warning, using cache/initial:', err);
  }

  // Check local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Auto-seed Firebase on first run
  seedCloudProducts(initialProducts);
  return initialProducts;
}

/**
 * Seed initial catalog to Firebase Realtime Database
 */
export async function seedCloudProducts(productsToSeed: Product[]): Promise<void> {
  try {
    const payload: { [key: string]: Product } = {};
    productsToSeed.forEach(p => { payload[p.id] = p; });

    await fetch(`${FIREBASE_REST_BASE}/products.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {}
}

/**
 * Save or update a product in Firebase (Instant customer visibility)
 */
export async function saveCloudProduct(product: Product): Promise<void> {
  try {
    await fetch(`${FIREBASE_REST_BASE}/products/${product.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  } catch (err) {
    console.warn('[CloudSync] Product save error:', err);
  }
}

/**
 * Delete a product from Firebase
 */
export async function deleteCloudProduct(productId: string): Promise<void> {
  try {
    await fetch(`${FIREBASE_REST_BASE}/products/${productId}.json`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('[CloudSync] Product delete error:', err);
  }
}

// =====================================================================
// ORDER CLOUD SYNC
// =====================================================================

export async function fetchCloudStoreData(): Promise<{ orders: Order[]; lastUpdated?: string }> {
  const orderMap = new Map<string, Order>();

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
  } catch {}

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

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (cached) {
      JSON.parse(cached).forEach((o: any) => {
        if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o);
      });
    }
  } catch {}

  const ordersList = Array.from(orderMap.values());
  ordersList.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));

  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(ordersList));
  } catch {}

  return { orders: ordersList, lastUpdated: new Date().toISOString() };
}

export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  try {
    await fetch(`${FIREBASE_REST_BASE}/orders/${newOrder.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch {}

  try {
    const current = await fetchCloudStoreData();
    const updated = [newOrder, ...current.orders.filter(o => o.id !== newOrder.id)];
    await fetch(BACKUP_REST_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updated, lastUpdated: new Date().toISOString() })
    });
  } catch {}

  broadcastOrders([newOrder]);
  const { orders } = await fetchCloudStoreData();
  return orders;
}

export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const updatedAt = new Date().toISOString();
  try {
    await fetch(`${FIREBASE_REST_BASE}/orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedAt })
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
