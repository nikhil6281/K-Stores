import type { Order, OrderStatus } from '../types';

// Dual-layer sync: Backend API (if available) + Central Global Cloud Storage (for GitHub Pages / cross-device)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const CLOUD_OBJECT_ID = 'ff808181a04ccf2d01a04d0879ff01f4';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

export interface CloudStoreData {
  orders: Order[];
  lastUpdated?: string;
}

/**
 * Fetch orders from both Backend API (if available) and Central Cloud Storage
 */
export async function fetchCloudStoreData(): Promise<CloudStoreData | null> {
  const orderMap = new Map<string, Order>();

  // 1. Try local/configured Express backend if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-cache',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json && json.success && Array.isArray(json.orders)) {
        json.orders.forEach((o: Order) => {
          if (o && o.id) orderMap.set(o.id, o);
        });
      }
    }
  } catch {
    // Backend may not be running in static hosting
  }

  // 2. Fetch from Central Global Cloud Storage (works across all devices anywhere)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-cache',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json && json.data && Array.isArray(json.data.orders)) {
        json.data.orders.forEach((o: Order) => {
          if (o && o.id) {
            // If we don't have this order yet, or if this cloud version has a more recent update
            const existing = orderMap.get(o.id);
            if (!existing) {
              orderMap.set(o.id, o);
            } else {
              // Prefer more advanced status if applicable
              const statusRank: Record<string, number> = {
                pending: 1,
                packing: 2,
                out_for_delivery: 3,
                delivered: 4,
                cancelled: 0,
              };
              const rankA = statusRank[existing.status] || 0;
              const rankB = statusRank[o.status] || 0;
              if (rankB >= rankA) {
                orderMap.set(o.id, o);
              }
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Central cloud sync fetch error:', err);
  }

  if (orderMap.size === 0) return null;

  const orders = Array.from(orderMap.values()).sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  return {
    orders,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save full orders array to Central Global Cloud Storage
 */
async function saveToGlobalCloud(orders: Order[]): Promise<boolean> {
  try {
    const payload = {
      name: 'kstores_village_kirana_live_sync',
      data: {
        orders,
        lastUpdated: new Date().toISOString(),
      },
    };

    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (err) {
    console.error('Error saving to global cloud:', err);
    return false;
  }
}

/**
 * Add a newly placed customer order to both Backend and Central Global Cloud
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  const mergedMap = new Map<string, Order>();
  mergedMap.set(newOrder.id, newOrder);

  // 1. Send to Express Backend (if available)
  try {
    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});
  } catch {
    // Ignore
  }

  // 2. Fetch current global cloud orders, merge, and save
  try {
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    if (response.ok) {
      const json = await response.json();
      const currentOrders: Order[] = (json && json.data && Array.isArray(json.data.orders))
        ? json.data.orders
        : [];

      currentOrders.forEach((o: Order) => {
        if (o && o.id && o.id !== newOrder.id) {
          mergedMap.set(o.id, o);
        }
      });
    }

    const updatedList = Array.from(mergedMap.values()).sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    await saveToGlobalCloud(updatedList);
    return updatedList;
  } catch (err) {
    console.error('Error syncing new order to global cloud:', err);
    return [newOrder];
  }
}

/**
 * Update an existing order status in both Backend and Central Global Cloud
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  // 1. Update on Express backend (if available)
  try {
    fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  } catch {
    // Ignore
  }

  // 2. Update on Central Global Cloud
  try {
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    if (response.ok) {
      const json = await response.json();
      const currentOrders: Order[] = (json && json.data && Array.isArray(json.data.orders))
        ? json.data.orders
        : [];

      const updated = currentOrders.map(o => (o.id === orderId ? { ...o, status } : o));
      await saveToGlobalCloud(updated);
      return updated;
    }
    return [];
  } catch (err) {
    console.error('Error updating order status in cloud:', err);
    return [];
  }
}
