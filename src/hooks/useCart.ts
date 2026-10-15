'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const { items, add, decrement, remove, clear } = useCartStore(
    useShallow((s) => ({ items: s.items, add: s.add, decrement: s.decrement, remove: s.remove, clear: s.clear })),
  );

  const summary = useMemo(() => {
    const lines = Object.values(items);
    return {
      lines,
      totalCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      // Faqat ko'rsatish uchun: yakuniy summani backend hisoblaydi
      totalPrice: lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    };
  }, [items]);

  return {
    ...summary,
    isEmpty: summary.lines.length === 0,
    quantityOf: (productId: number) => items[productId]?.quantity ?? 0,
    add: (product: Product) => add(product),
    decrement,
    remove,
    clear,
    /** Mahsulotlar ro'yxati yangilanganda: o'chirilganlarni olib tashlaydi, narxlarni yangilaydi */
    syncWith: (products: Product[]) => {
      const byId = new Map(products.map((p) => [p.id, p]));
      useCartStore.setState((state) => {
        const next: typeof state.items = {};
        for (const item of Object.values(state.items)) {
          const fresh = byId.get(item.product.id);
          if (fresh) next[fresh.id] = { product: fresh, quantity: item.quantity };
        }
        return { items: next };
      });
    },
  };
}
