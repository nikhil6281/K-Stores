import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  update 
} from 'firebase/database';
import type { Order, OrderStatus } from '../types';
import { firebaseConfig } from './firebaseSync';

// Initialize Firebase Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const LOCAL_STORAGE_KEY = 'kstores_orders_list';
const SYNC_CHANNEL_NAME = 'kstores_firebase_orders_sync';

// Local BroadcastChannel for same-browser instant tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

/**
 * Fetch all orders from Firebase Realtime Database
 */
export async function fetchCloudStoreData(): Promise<{ orders: Order[]; lastUpdated?: string }> {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersList: Order[] = Object.values(data);
      ordersList.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      // Cache locally
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ordersList));
      } catch {}

      return { orders: ordersList, lastUpdated: new Date().toISOString() };
    }
  } catch (err) {
    console.warn('[Firebase] Read error, reading from local cache:', err);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return { orders: cached ? JSON.parse(cached) : [] };
  } catch {
    return { orders: [] };
  }
}

/**
 * Add / Push a new customer order to Firebase Realtime Database
 */
export async function addOrderToCloud(newOrder: Order): Promise<Order[]> {
  try {
    const orderRef = ref(db, `orders/${newOrder.id}`);
    await set(orderRef, newOrder);

    // Broadcast to other open tabs
    broadcastOrders([newOrder]);
  } catch (err) {
    console.warn('[Firebase] Write error, saved locally:', err);
  }

  const { orders } = await fetchCloudStoreData();
  return orders;
}

/**
 * Update order status in Firebase Realtime Database (e.g. pending -> delivered)
 */
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    const { orders } = await fetchCloudStoreData();
    broadcastOrders(orders);
    return true;
  } catch (err) {
    console.warn('[Firebase] Status update error:', err);
    return false;
  }
}

/**
 * Real-time WebSocket listener from Firebase
 */
export function onBroadcastOrderUpdate(callback: (orders: Order[]) => void): () => void {
  try {
    const ordersRef = ref(db, 'orders');
    const unsubscribeFirebase = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList: Order[] = Object.values(data);
        ordersList.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        callback(ordersList);
      }
    });

    const handleBroadcastMessage = (event: MessageEvent) => {
      if (Array.isArray(event.data)) {
        callback(event.data);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    return () => {
      unsubscribeFirebase();
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
    };
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
