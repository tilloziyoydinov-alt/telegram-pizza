'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { api, ApiError, type Order, type OrderStatus } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

const STATUS: Record<OrderStatus, string> = {
  new: '🆕 Yangi',
  accepted: '👨‍🍳 Tayyorlanmoqda',
  delivering: '🚗 Yo‘lda',
  done: '✅ Yetkazildi',
  cancelled: '❌ Bekor qilindi',
};

export function OrdersList() {
  const { initData, isTelegram } = useTelegram();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isTelegram) return;
    api
      .getMyOrders(initData)
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Yuklab bo‘lmadi'));
  }, [initData, isTelegram]);

  if (!isTelegram) return <p className="muted center">Buyurtmalarni ko‘rish uchun ilovani Telegram orqali oching.</p>;
  if (error) return <p className="field-error center">{error}</p>;
  if (!orders) return <div className="spinner spinner-lg" aria-label="Yuklanmoqda" />;
  if (orders.length === 0) return <p className="muted center">Hali buyurtmalar yo‘q.</p>;

  return (
    <ul className="cart-list">
      {orders.map((o) => (
        <li key={o.id} className="card order">
          <div className="order-head">
            <strong>#{o.id}</strong>
            <span>{STATUS[o.status]}</span>
          </div>
          <p className="muted">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
          <div className="order-head">
            <span className="muted">{formatDate(o.createdAt)}</span>
            <strong>{formatPrice(o.totalPrice)}</strong>
          </div>
        </li>
      ))}
    </ul>
  );
}
