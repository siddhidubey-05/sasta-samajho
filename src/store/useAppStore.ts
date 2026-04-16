import { create } from 'zustand';
import { CartItem, Language } from '@/types';

interface AppState {
  cart: CartItem[];
  language: Language;
  selectedCity: string;
  searchQuery: string;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setLanguage: (lang: Language) => void;
  setCity: (city: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cart: [],
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
  setLanguage: (language) => set({ language }),
  setCity: (selectedCity) => set({ selectedCity }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
