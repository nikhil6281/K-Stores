import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  update 
} from 'firebase/database';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import type { Order, OrderStatus, CartItem } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
  authDomain: "k-store-ae9dd.firebaseapp.com",
  databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
  projectId: "k-store-ae9dd",
  storageBucket: "k-store-ae9dd.firebasestorage.app",
  messagingSenderId: "836118831556",
  appId: "1:836118831556:web:252f2b36309ef7ed220491",
  measurementId: "G-XER98BP06Y"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);

export async function signInWithGoogleReal() {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    id: user.uid,
    name: user.displayName || 'Customer',
    email: user.email || '',
    phone: user.phoneNumber?.replace(/\D/g, '') || '',
    photoURL: user.photoURL || ''
  };
}

export async function signOutReal() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('[Firebase] Sign out error:', err);
  }
}

export function subscribeToLiveOrders(callback: (orders: Order[]) => void): () => void {
  try {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList: Order[] = Object.values(data);
        ordersList.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        callback(ordersList);
      } else {
        callback([]);
      }
    }, (err) => {
      console.warn('[Firebase] Orders listener warning:', err);
    });
    return () => unsubscribe();
  } catch (err) {
    console.warn('[Firebase] Init warning:', err);
    return () => {};
  }
}

export function subscribeToUserCart(
  userId: string, 
  callback: (cart: CartItem[]) => void
): () => void {
  if (!userId) return () => {};
  try {
    const cleanId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cartRef = ref(db, `user_carts/${cleanId}`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = snapshot.val();
        callback(Array.isArray(items) ? items : []);
      } else {
        callback([]);
      }
    });
    return () => unsubscribe();
  } catch {
    return () => {};
  }
}

export async function syncCartToCloud(userId: string, cart: CartItem[]): Promise<void> {
  if (!userId) return;
  try {
    const cleanId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cartRef = ref(db, `user_carts/${cleanId}`);
    await set(cartRef, cart);
  } catch (err) {
    console.warn('[Firebase] Cart sync error:', err);
  }
}

export async function pushOrderToCloud(newOrder: Order): Promise<void> {
  try {
    const orderRef = ref(db, `orders/${newOrder.id}`);
    await set(orderRef, newOrder);
  } catch (err) {
    console.warn('[Firebase] Order push error:', err);
  }
}

export async function updateOrderStatusInCloud(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const statusRef = ref(db, `orders/${orderId}`);
    await update(statusRef, { 
      status, 
      updatedAt: new Date().toISOString() 
    });
  } catch (err) {
    console.warn('[Firebase] Status update error:', err);
  }
}
