import type { Order, OrderStatus } from '../types';

/**
 * K-Stores Order Sync Service
 * 
 * Architecture:
 * 1. LOCAL STORAGE: Primary data store — always works, instant
 * 2. BROADCAST CHANNEL: Syncs across browser tabs on same device instantly
 * 3. EXPRESS BACKEND (when running): True cross-device sync via server API
 * 4. CLOUD FALLBACK: Uses a shared cloud JSON endpoint for cross-device when no backend
 * 
 * The cloud fallback uses localStorage as a write-through cache
 * to minimize API calls and stay within rate limits.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Shared localStorage key for cross-tab sync on same device
const CLOUD_ORDERS_CACHE_KEY = 'kstores_cloud_orders_cache';

// Cloud endpoint — only used as a cross-device relay, NOT for polling
const CLOUD_OBJECT_ID = 'ff808181a04ccf2d01a04d0879ff01f4';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

// Minimum seconds between cloud API calls to respect rate limits
const CLOUD_MIN_INTERVAL_MS = 30_000; // 30 seconds between reads
const CLOUD_PUSH_INTERVAL_MS = 10_000; // 10 seconds between writes

// BroadcastChannel for instant same-device cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('kstores_orders_sync');
} catch {
  // BroadcastChannel not supported in some browsers
}

let lastCloudFetchTime = 0;
let lastCloudPushTime = 0;
let backendAvailable: boolean | null = null; // null = unknown, true/false = checked

export interface CloudStoreData {
  orders: Order[];
  lastUpdated?: string;
}

/**
 * Broadcast an order update to all other tabs on the same device
 */
export function broadcastOrderUpdate(orders: Order[]): void {
  try {
    broadcastChannel?.postMessage({ type: 'orders_update', orders, ts: Date.now() });
  } catch {
    // Ignore
  }
}

/**
 * Listen for order updates from other tabs
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
 * Check if the Express backend is reachable (with caching)
 */
async function isBackendAvailable(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  // Re-check every 60 seconds
  setTimeout(() => { backendAvailable = null; }, 60_000);
  return backendAvailable;
}

/**
 * Fetch orders from available sources
 */
export async function fetchCloudStoreData(): Promise<CloudStoreData | null> {
  const orderMap = new Map<string, Order>();

  // 1. Try Express backend first (instant, reliable)
  if (await isBackendAvailable()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
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
            if (o?.id) orderMap.set(o.id, o);
          });
          
          // Also update local cache for other tabs
          try {
            localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(json.orders));
          } catch { /* quota */ }
          
          return {
            orders: json.orders,
            lastUpdated: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Backend unavailable this time
    }
  }

  // 2. Read from localStorage cache (shared with other tabs)
  try {
    const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
    if (cached) {
      const cachedOrders: Order[] = JSON.parse(cached);
      if (Array.isArray(cachedOrders)) {
        cachedOrders.forEach((o: Order) => {
          if (o?.id) orderMap.set(o.id, o);
        });
      }
    }
  } catch {
    // Ignore parse errors
  }

  // 3. Cloud fallback — rate-limited to avoid 429/quota errors
  const now = Date.now();
  if (now - lastCloudFetchTime >= CLOUD_MIN_INTERVAL_MS) {
    lastCloudFetchTime = now;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(CLOUD_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json?.data && Array.isArray(json.data.orders)) {
          json.data.orders.forEach((o: Order) => {
            if (o?.id) {
              const existing = orderMap.get(o.id);
              if (!existing) {
                orderMap.set(o.id, o);
              } else {
                // Prefer more advanced status
                const statusRank: Record<string, number> = {
                  pending: 1, packing: 2, out_for_delivery: 3, delivered: 4, cancelled: 0,
                };
                if ((statusRank[o.status] || 0) >= (statusRank[existing.status] || 0)) {
                  orderMap.set(o.id, o);
                }
              }
            }
          });

          // Update cache
          const allOrders = Array.from(orderMap.values());
          try {
            localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(allOrders));
          } catch { /* quota */ }
        }
      }
    } catch {
      // Cloud endpoint unreachable — rely on cache
    }
  }

  if (orderMap.size === 0) return null;

  const orders = Array.from(orderMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  return { orders, lastUpdated: new Date().toISOString() };
}

/**
 * Save orders to cloud (rate-limited)
 */
async function pushToCloud(orders: Order[]): Promise<boolean> {
  const now = Date.now();
  if (now - lastCloudPushTime < CLOUD_PUSH_INTERVAL_MS) return true; // Throttled
  lastCloudPushTime = now;

  try {
    const payload = {
      name: 'kstores_village_kirana_live_sync',
      data: { orders, lastUpdated: new Date().toISOString() },
    };
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Add a newly placed order
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  // 1. Update localStorage cache immediately (for all tabs)
  let allOrders: Order[] = [newOrder];
  try {
    const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
    if (cached) {
      const existing: Order[] = JSON.parse(cached);
      if (Array.isArray(existing)) {
        allOrders = [newOrder, ...existing.filter(o => o.id !== newOrder.id)];
      }
    }
    localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(allOrders));
  } catch { /* quota */ }

  // 2. Broadcast to other tabs immediately
  broadcastOrderUpdate(allOrders);

  // 3. Push to Express backend (if available)
  if (await isBackendAvailable()) {
    try {
      fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
    } catch { /* fire-and-forget */ }
  }

  // 4. Push to cloud (rate-limited)
  pushToCloud(allOrders).catch(() => {});

  return allOrders;
}

/**
 * Update an order's status
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  // 1. Update localStorage cache
  let updatedOrders: Order[] = [];
  try {
    const cached = localStorage.getItem(CLOUD_ORDERS_CACHE_KEY);
    if (cached) {
      const orders: Order[] = JSON.parse(cached);
      if (Array.isArray(orders)) {
        updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
        localStorage.setItem(CLOUD_ORDERS_CACHE_KEY, JSON.stringify(updatedOrders));
      }
    }
  } catch { /* ignore */ }

  // 2. Broadcast to other tabs
  broadcastOrderUpdate(updatedOrders);

  // 3. Push to Express backend
  if (await isBackendAvailable()) {
    try {
      fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch { /* fire-and-forget */ }
  }

  // 4. Push to cloud (rate-limited)
  if (updatedOrders.length > 0) {
    pushToCloud(updatedOrders).catch(() => {});
  }

  return updatedOrders;
}
