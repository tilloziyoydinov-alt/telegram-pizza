'use client';

import { Button } from '@/components/ui/Button';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { useCart } from '@/hooks/useCart';
import { useTelegram } from '@/hooks/useTelegram';
import type { Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { quantityOf, add, decrement } = useCart();
  const { haptic } = useTelegram();
  const quantity = quantityOf(product.id);

  const increment = () => {
    add(product);
    haptic('light');
  };

  return (
    <article className="card product">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="product-img" src={product.imageUrl} alt={product.name} loading="lazy" />
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <div className="product-footer">
          <strong>{formatPrice(product.price)}</strong>
          {quantity > 0 ? (
            <QuantityControl value={quantity} onIncrement={increment} onDecrement={() => decrement(product.id)} />
          ) : (
            <Button size="sm" onClick={increment}>
              Qo‘shish
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
