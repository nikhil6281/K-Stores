import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { db } from './firebaseSync';
import { initialProducts } from '../data/initialProducts';
import type { Product } from '../types';

/**
 * 1. Subscribe to live product catalog updates (Customer + Owner)
 * Automatically seeds Firebase if /products is empty.
 */
export function subscribeToLiveCatalog(callback: (products: Product[]) => void): () => void {
  try {
    const productsRef = ref(db, 'products');

    // Check & auto-seed if empty on startup
    get(productsRef).then((snapshot) => {
      if (!snapshot.exists() || !snapshot.val()) {
        const seedMap: Record<string, Product> = {};
        initialProducts.forEach((p) => {
          seedMap[p.id] = p;
        });
        set(productsRef, seedMap);
      }
    }).catch((err) => {
      console.warn('[FirebaseCatalog] Seed check error:', err);
    });

    // Realtime onValue listener
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: Product[] = Object.values(data);
        callback(list);
      } else {
        callback(initialProducts);
      }
    });

    return () => unsubscribe();
  } catch (err) {
    console.warn('[FirebaseCatalog] Listener error, using fallback:', err);
    callback(initialProducts);
    return () => {};
  }
}

/**
 * 2. Owner Write: Add a new product to Firebase /products/{id}
 */
export async function addProductToFirebase(product: Product): Promise<void> {
  try {
    const productRef = ref(db, `products/${product.id}`);
    await set(productRef, product);
  } catch (err) {
    console.error('[FirebaseCatalog] Add product error:', err);
  }
}

/**
 * 3. Owner Write: Update price, stock, or details in Firebase /products/{id}
 */
export async function updateProductInFirebase(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    const productRef = ref(db, `products/${productId}`);
    await update(productRef, updates);
  } catch (err) {
    console.error('[FirebaseCatalog] Update product error:', err);
  }
}

/**
 * 4. Owner Write: Delete a product from Firebase /products/{id}
 */
export async function deleteProductFromFirebase(productId: string): Promise<void> {
  try {
    const productRef = ref(db, `products/${productId}`);
    await remove(productRef);
  } catch (err) {
    console.error('[FirebaseCatalog] Delete product error:', err);
  }
}
