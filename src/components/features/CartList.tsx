'use client';

import { Button } from '@/components/ui/Button';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export function CartList({ onCheckout, showCheckoutButton }: { onCheckout: () => void; showCheckoutButton: boolean }) {
  const { lines, totalPrice, isEmpty, add, decrement, remove, clear } = useCart();

  if (isEmpty) {
    return (
      <div className="empty">
        <div className="empty-icon">🛒</div>
        <p>Savat bo‘sh. Menyudan pitsa tanlang!</p>
      </div>
    );
  }

  return (
    <section>
      <ul className="cart-list">
        {lines.map(({ product, quantity }) => (
          <li key={product.id} className="card cart-item">
            <div className="cart-item-info">
              <h3>{product.name}</h3>
              <span className="muted">{formatPrice(product.price * quantity)}</span>
            </div>
            <QuantityControl value={quantity} onIncrement={() => add(product)} onDecrement={() => decrement(product.id)} />
            <button className="icon-btn" onClick={() => remove(product.id)} aria-label={`${product.name}ni o‘chirish`}>
              🗑
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <span>Jami:</span>
        <strong>{formatPrice(totalPrice)}</strong>
      </div>
      <div className="stack">
        {showCheckoutButton && (
          <Button block size="lg" onClick={onCheckout}>
            Rasmiylashtirish
          </Button>
        )}
        <Button block variant="ghost" onClick={clear}>
          Savatni tozalash
        </Button>
      </div>
    </section>
  );
}
