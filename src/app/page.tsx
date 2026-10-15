'use client';

import { useCallback, useEffect, useState } from 'react';
import { CartList } from '@/components/features/CartList';
import { CheckoutForm } from '@/components/features/CheckoutForm';
import { OrdersList } from '@/components/features/OrdersList';
import { ProductCard } from '@/components/features/ProductCard';
import { BottomNavigation, type Tab } from '@/components/layout/BottomNavigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/hooks/useCart';
import { useMainButton, useTelegram } from '@/hooks/useTelegram';
import { api, ApiError, type Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

/** Telegram MainButton'ni faqat kerak bo'lganda "ulaydi" (bir vaqtda bitta egasi bo'lishi uchun) */
function MainButtonBinding({ text, onClick }: { text: string; onClick: () => void }) {
  useMainButton({ text, visible: true, onClick });
  return null;
}

export default function HomePage() {
  const { isTelegram, webApp } = useTelegram();
  const cart = useCart();
  const [tab, setTab] = useState<Tab>('menu');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoadError('');
    try {
      const list = await api.getProducts();
      setProducts(list);
      cart.syncWith(list);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Menyuni yuklab bo‘lmadi');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const closeModal = useCallback(() => {
    setCheckoutOpen(false);
    if (successOrderId) setTab('orders');
    setSuccessOrderId(null);
  }, [successOrderId]);

  const showCartButton = isTelegram && !cart.isEmpty && !checkoutOpen && tab !== 'orders';

  return (
    <main className="app">
      <Header />

      {tab === 'menu' && (
        <section className="grid">
          {loadError && (
            <div className="empty">
              <p className="field-error">{loadError}</p>
              <Button onClick={loadProducts}>Qayta urinish</Button>
            </div>
          )}
          {!products && !loadError && <div className="spinner spinner-lg" aria-label="Yuklanmoqda" />}
          {products?.map((p) => <ProductCard key={p.id} product={p} />)}
        </section>
      )}

      {tab === 'cart' && <CartList onCheckout={() => setCheckoutOpen(true)} showCheckoutButton={!isTelegram} />}
      {tab === 'orders' && <OrdersList />}

      {showCartButton && (
        <MainButtonBinding
          text={tab === 'menu' ? `Savat · ${formatPrice(cart.totalPrice)}` : `Rasmiylashtirish · ${formatPrice(cart.totalPrice)}`}
          onClick={() => (tab === 'menu' ? setTab('cart') : setCheckoutOpen(true))}
        />
      )}

      <Modal open={checkoutOpen} title={successOrderId ? 'Rahmat!' : 'Buyurtmani rasmiylashtirish'} onClose={closeModal}>
        {successOrderId ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <p>
              Buyurtma <b>#{successOrderId}</b> qabul qilindi. Holati haqida botda xabar beramiz.
            </p>
            <Button block onClick={() => (webApp ? webApp.close() : closeModal())}>
              {webApp ? 'Botga qaytish' : 'Yopish'}
            </Button>
          </div>
        ) : (
          <CheckoutForm onSuccess={setSuccessOrderId} />
        )}
      </Modal>

      <BottomNavigation active={tab} onChange={setTab} cartCount={cart.totalCount} />
    </main>
  );
}
