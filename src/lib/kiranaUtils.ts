// Utilities for managing kirana store prices in localStorage

export interface KiranaStorePrice {
  id: string;
  productTitle: string;
  storeName: string;
  price: number;
  timestamp: number;
  city: string;
}

const KIRANA_STORAGE_KEY = 'sasta_samajho_kirana_stores';

/**
 * Get all kirana store prices for a specific product
 */
export const getKiranaStores = (productTitle: string): KiranaStorePrice[] => {
  try {
    const stored = localStorage.getItem(KIRANA_STORAGE_KEY);
    if (!stored) return [];
    const all = JSON.parse(stored) as KiranaStorePrice[];
    return all.filter((store) => store.productTitle.toLowerCase() === productTitle.toLowerCase());
  } catch {
    return [];
  }
};

/**
 * Save a new kirana store price
 */
export const saveKiranaStore = (productTitle: string, storeName: string, price: number, city: string) => {
  try {
    const stored = localStorage.getItem(KIRANA_STORAGE_KEY);
    let all: KiranaStorePrice[] = stored ? JSON.parse(stored) : [];

    const newStore: KiranaStorePrice = {
      id: `kirana_${Date.now()}`,
      productTitle,
      storeName,
      price,
      timestamp: Date.now(),
      city,
    };

    all.push(newStore);
    localStorage.setItem(KIRANA_STORAGE_KEY, JSON.stringify(all));
    return newStore;
  } catch {
    return null;
  }
};

/**
 * Delete a kirana store price
 */
export const deleteKiranaStore = (id: string) => {
  try {
    const stored = localStorage.getItem(KIRANA_STORAGE_KEY);
    if (!stored) return;
    const all = JSON.parse(stored) as KiranaStorePrice[];
    const filtered = all.filter((store) => store.id !== id);
    localStorage.setItem(KIRANA_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Handle error silently
  }
};

/**
 * Get average price from kirana stores for a product
 */
export const getAverageKiranaPrice = (productTitle: string): number | null => {
  const stores = getKiranaStores(productTitle);
  if (stores.length === 0) return null;
  const sum = stores.reduce((acc, store) => acc + store.price, 0);
  return sum / stores.length;
};

/**
 * Get cheapest option across all sources
 */
export const getCheapestOption = (platformPrices: Record<string, number>, kiranaPrice?: number) => {
  const allOptions = { ...platformPrices };
  if (kiranaPrice) {
    allOptions.kirana = kiranaPrice;
  }

  let cheapest = { source: '', price: Infinity };
  Object.entries(allOptions).forEach(([source, price]) => {
    if (price < cheapest.price) {
      cheapest = { source, price };
    }
  });

  return cheapest;
};
