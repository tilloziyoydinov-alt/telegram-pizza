import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: Record<number, CartItem>;
  add: (product: Product) => void;
  decrement: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const MAX_QUANTITY = 50;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      add: (product) =>
        set((state) => {
          const quantity = Math.min((state.items[product.id]?.quantity ?? 0) + 1, MAX_QUANTITY);
          return { items: { ...state.items, [product.id]: { product, quantity } } };
        }),
      decrement: (productId) =>
        set((state) => {
          const item = state.items[productId];
          if (!item) return state;
          const { [productId]: _, ...rest } = state.items;
          return { items: item.quantity > 1 ? { ...rest, [productId]: { ...item, quantity: item.quantity - 1 } } : rest };
        }),
      remove: (productId) =>
        set((state) => {
          const { [productId]: _, ...rest } = state.items;
          return { items: rest };
        }),
      clear: () => set({ items: {} }),
    }),
    {
      name: 'pizza-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
