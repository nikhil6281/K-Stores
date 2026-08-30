import type { Order, OrderStatus } from '../types';

/**
 * K-Stores Universal Cross-Device Order Sync Engine
 * 
 * Synchronizes orders in real-time across all devices (phones, tablets, laptops)
 * using a multi-tier architecture:
 * 1. Live Global Cloud Storage (extendsclass JSON storage bin)
 * 2. Express Backend API (when running locally or hosted)
 * 3. BroadcastChannel + localStorage (instant same-device tab sync)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Central Cloud Storage Bin (Zero rate limits, public real-time REST endpoint)
const CLOUD_STORAGE_URL = 'https://extendsclass.com/api/json-storage/bin/fbcdbcf';
const CLOUD_ORDERS_CACHE_KEY = 'kstores_cloud_orders_cache';

// BroadcastChannel for instant cross-tab sync on same device
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('kstores_orders_sync');
} catch {
  // BroadcastChannel not available in older environments
}

export interface CloudStoreData {
  orders: Order[];
  lastUpdated?: string;
}

/**
 * Broadcast an order update to all other open tabs on this device
 */
export function broadcastOrderUpdate(orders: Order[]): void {
  try {
    broadcastChannel?.postMessage({ type: 'orders_update', orders, ts: Date.now() });
  } catch {
    // Ignore
  }
}

/**
 * Listen for real-time order updates from other tabs
 */
export function onBroadcastOrderUpdate(callback: (orders: Order[]) => void): () => void {
  if (!broadcastChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'orders_update' && Array.isArray(event.data.orders)) {
      callback(event.data.orders);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel?.removeEventListener('message', handler);
}

/**
 * Fetch latest orders from all sources (Express backend + Global Cloud Store + Local Cache)
 */
export async function fetchCloudStoreData(): Promise<CloudStoreData | null> {
  const orderMap = new Map<string, Order>();

  // 1. Fetch from Central Global Cloud Storage (Primary for cross-device)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(CLOUD_STORAGE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-cache',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const rawOrders = Array.isArray(json?.orders) ? json.orders : (Array.isArray(json) ? json : []);
      rawOrders.forEach((o: Order) => {
        if (o && o.id) orderMap.set(o.id, o);
      });
    }
  } catch (err) {
    console.warn('Central cloud sync fetch warning:', err);
  }

  // 2. Fetch from Express backend (if available locally or hosted)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-cache',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json?.success && Array.isArray(json.orders)) {
        json.orders.forEach((o: Order) => {
          if (o && o.id) orderMap.set(o.id, o);
        });
      }
    }
  } catch {
    // Backend offline / static mode
  }

  // 3. Merge with localStorage cache
  try {
    const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
    if (cached) {
      const cachedOrders: Order[] = JSON.parse(cached);
      if (Array.isArray(cachedOrders)) {
        cachedOrders.forEach((o: Order) => {
          if (o && o.id && !orderMap.has(o.id)) {
            orderMap.set(o.id, o);
          }
        });
      }
    }
  } catch {
    // Ignore parse error
  }

  if (orderMap.size === 0) return null;

  const orders = Array.from(orderMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  // Save merged state to local cache
  try {
    localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore quota
  }

  return { orders, lastUpdated: new Date().toISOString() };
}

/**
 * Save full orders array to Central Global Cloud Storage
 */
async function saveToGlobalCloud(orders: Order[]): Promise<boolean> {
  try {
    const payload = {
      orders,
      lastUpdated: new Date().toISOString(),
    };

    const response = await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (err) {
    console.error('Error writing to central cloud store:', err);
    return false;
  }
}

/**
 * Push newly placed customer order to Central Global Cloud and Local Cache
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  const mergedMap = new Map<string, Order>();
  mergedMap.set(newOrder.id, newOrder);

  // 1. Fetch latest orders from cloud first to prevent overwriting
  try {
    const response = await fetch(CLOUD_STORAGE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    if (response.ok) {
      const json = await response.json();
      const existing: Order[] = Array.isArray(json?.orders) ? json.orders : [];
      existing.forEach((o: Order) => {
        if (o && o.id) mergedMap.set(o.id, o);
      });
    }
  } catch {
    // If cloud read fails, load from localStorage cache
    try {
      const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
      if (cached) {
        const cachedOrders: Order[] = JSON.parse(cached);
        if (Array.isArray(cachedOrders)) {
          cachedOrders.forEach((o: Order) => {
            if (o && o.id) mergedMap.set(o.id, o);
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  // Ensure newest order is present
  mergedMap.set(newOrder.id, newOrder);

  const updatedList = Array.from(mergedMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  // 2. Save to Central Global Cloud Storage
  saveToGlobalCloud(updatedList).catch(() => {});

  // 3. Save to Express Backend (if available)
  try {
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});
  } catch {
    // Ignore
  }

  // 4. Update local cache and broadcast to same-device tabs
  try {
    localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(updatedList));
  } catch {
    // Ignore
  }
  broadcastOrderUpdate(updatedList);

  return updatedList;
}

/**
 * Update an order's status across all devices
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  const mergedMap = new Map<string, Order>();

  try {
    const response = await fetch(CLOUD_STORAGE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    if (response.ok) {
      const json = await response.json();
      const existing: Order[] = Array.isArray(json?.orders) ? json.orders : [];
      existing.forEach((o: Order) => {
        if (o && o.id) {
          mergedMap.set(o.id, o.id === orderId ? { ...o, status } : o);
        }
      });
    }
  } catch {
    // Fallback to cache
    try {
      const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
      if (cached) {
        const cachedOrders: Order[] = JSON.parse(cached);
        if (Array.isArray(cachedOrders)) {
          cachedOrders.forEach((o: Order) => {
            if (o && o.id) {
              mergedMap.set(o.id, o.id === orderId ? { ...o, status } : o);
            }
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  const updatedList = Array.from(mergedMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  saveToGlobalCloud(updatedList).catch(() => {});

  try {
    fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  } catch {
    // Ignore
  }

  try {
    localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(updatedList));
  } catch {
    // Ignore
  }
  broadcastOrderUpdate(updatedList);

  return updatedList;
}
