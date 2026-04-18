import { create } from 'zustand';
import { CartItem, Language } from '@/types';
import type { LiveProduct } from '@/hooks/useLiveProducts';

export interface LiveCartItem {
  productId: string;
  quantity: number;
  product: LiveProduct;
}

interface AppState {
  cart: CartItem[];
  liveCart: LiveCartItem[];
  language: Language;
  selectedCity: string;
  searchQuery: string;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addLiveToCart: (product: LiveProduct) => void;
  removeLiveFromCart: (productId: string) => void;
  updateLiveQuantity: (productId: string, quantity: number) => void;
  clearLiveCart: () => void;
  setLanguage: (lang: Language) => void;
  setCity: (city: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cart: [],
  liveCart: [],
  language: 'hi',
  selectedCity: 'Mumbai',
  searchQuery: '',

  addToCart: (productId) =>
    set((state) => {
      const existing = state.cart.find((i) => i.productId === productId);
      if (existing) {
        return { cart: state.cart.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { cart: [...state.cart, { productId, quantity: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) return { cart: state.cart.filter((i) => i.productId !== productId) };
      return { cart: state.cart.map((i) => i.productId === productId ? { ...i, quantity } : i) };
    }),

  clearCart: () => set({ cart: [] }),

  addLiveToCart: (product) =>
    set((state) => {
      const existing = state.liveCart.find((i) => i.productId === product.id);
      if (existing) {
        return {
          liveCart: state.liveCart.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { liveCart: [...state.liveCart, { productId: product.id, quantity: 1, product }] };
    }),

  removeLiveFromCart: (productId) =>
    set((state) => ({ liveCart: state.liveCart.filter((i) => i.productId !== productId) })),

  updateLiveQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) return { liveCart: state.liveCart.filter((i) => i.productId !== productId) };
      return {
        liveCart: state.liveCart.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    }),

  clearLiveCart: () => set({ liveCart: [] }),

  setLanguage: (language) => set({ language }),
  setCity: (selectedCity) => set({ selectedCity }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
