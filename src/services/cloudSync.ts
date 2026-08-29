import type { Order, OrderStatus, Product, StoreDeal } from '../types';

// Central Cloud Sync Endpoint for K-Stores (Works across all devices globally)
const CLOUD_OBJECT_ID = 'ff808181a04ccf2d01a04d0879ff01f4';
const CLOUD_ENDPOINT = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

export interface CloudStoreData {
  orders: Order[];
  products?: Product[];
  deals?: StoreDeal[];
  lastUpdated: string;
}

/**
 * Fetch all shared store data from the central cloud database
 */
export async function fetchCloudStoreData(): Promise<CloudStoreData | null> {
  try {
    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.warn('Cloud sync fetch returned status:', response.status);
      return null;
    }

    const json = await response.json();
    if (json && json.data) {
      return {
        orders: Array.isArray(json.data.orders) ? json.data.orders : [],
        products: Array.isArray(json.data.products) ? json.data.products : undefined,
        deals: Array.isArray(json.data.deals) ? json.data.deals : undefined,
        lastUpdated: json.data.lastUpdated || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch from cloud sync:', err);
    return null;
  }
}

/**
 * Push an updated orders list or single order to the cloud
 */
export async function saveCloudOrders(orders: Order[]): Promise<boolean> {
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (err) {
    console.error('Failed to save orders to cloud:', err);
    return false;
  }
}

/**
 * Add a newly placed customer order to the cloud database
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  try {
    // 1. Fetch current cloud orders to ensure no overwriting
    const cloudData = await fetchCloudStoreData();
    const currentOrders = cloudData?.orders || [];

    // 2. Merge without duplicates (newest first)
    const filtered = currentOrders.filter(o => o.id !== newOrder.id);
    const updatedOrders = [newOrder, ...filtered];

    // 3. Save back to cloud
    await saveCloudOrders(updatedOrders);
    return updatedOrders;
  } catch (err) {
    console.error('Error adding order to cloud:', err);
    return [newOrder];
  }
}

/**
 * Update an existing order status in the cloud
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  try {
    const cloudData = await fetchCloudStoreData();
    const currentOrders = cloudData?.orders || [];

    const updatedOrders = currentOrders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );

    await saveCloudOrders(updatedOrders);
    return updatedOrders;
  } catch (err) {
    console.error('Error updating order status in cloud:', err);
    return [];
  }
}
