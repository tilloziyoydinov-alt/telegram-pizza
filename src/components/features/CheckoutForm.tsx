'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useCart } from '@/hooks/useCart';
import { useMainButton, useTelegram } from '@/hooks/useTelegram';
import { api, ApiError } from '@/lib/api';
import { formatPrice, isValidUzPhone, normalizePhone } from '@/lib/utils';

type Errors = Partial<Record<'phone' | 'address' | 'form', string>>;

export function CheckoutForm({ onSuccess }: { onSuccess: (orderId: number) => void }) {
  const { lines, totalPrice, clear } = useCart();
  const { initData, webApp, isTelegram } = useTelegram();
  const [phone, setPhone] = useState('+998');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!isValidUzPhone(normalizePhone(phone))) next.phone = 'Raqamni +998 XX XXX XX XX formatida kiriting';
    if (address.trim().length < 5) next.address = 'Manzilni to‘liqroq kiriting';
    return next;
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      webApp?.HapticFeedback.notificationOccurred('error');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder(
        {
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          phone: normalizePhone(phone),
          address: address.trim(),
          comment: comment.trim() || undefined,
        },
        initData,
      );
      webApp?.HapticFeedback.notificationOccurred('success');
      clear();
      onSuccess(order.id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Kutilmagan xatolik';
      setErrors({ form: message });
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setSubmitting(false);
    }
  };

  useMainButton({
    text: `Tasdiqlash · ${formatPrice(totalPrice)}`,
    visible: true,
    loading: submitting,
    onClick: () => void submit(),
  });

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <Input
        label="Telefon raqam"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setErrors((prev) => ({ ...prev, phone: undefined }));
        }}
        error={errors.phone}
      />
      <Textarea
        label="Yetkazib berish manzili"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          setErrors((prev) => ({ ...prev, address: undefined }));
        }}
        placeholder="Tuman, ko‘cha, uy, mo‘ljal"
        maxLength={500}
        error={errors.address}
      />
      <Textarea
        label="Izoh (ixtiyoriy)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      {!isTelegram && <p className="field-error">Buyurtma berish uchun ilovani Telegram bot orqali oching.</p>}
      {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
      {/* Telegram ichida MainButton ishlatiladi; brauzerda — oddiy tugma */}
      {!isTelegram && (
        <Button type="submit" block size="lg" loading={submitting}>
          Tasdiqlash · {formatPrice(totalPrice)}
        </Button>
      )}
    </form>
  );
}
