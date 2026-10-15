import { InlineKeyboard } from 'grammy';
import config from '../config/default.js';

export const menuKeyboard = () => new InlineKeyboard().webApp('🍕 Menyuni ochish', config.webAppUrl);

// Admin uchun buyurtma holatini o'zgartirish tugmalari (holatga qarab)
const NEXT_ACTIONS = {
  new: [['👨‍🍳 Qabul qilish', 'accepted'], ['❌ Bekor qilish', 'cancelled']],
  accepted: [['🚗 Yo‘lga chiqdi', 'delivering'], ['❌ Bekor qilish', 'cancelled']],
  delivering: [['✅ Yetkazildi', 'done']],
};

export function orderAdminKeyboard(order) {
  const actions = NEXT_ACTIONS[order.status];
  if (!actions) return undefined;
  const kb = new InlineKeyboard();
  for (const [text, status] of actions) kb.text(text, `order:${order.id}:${status}`);
  return kb;
}

export function allowedNextStatuses(status) {
  return (NEXT_ACTIONS[status] ?? []).map(([, next]) => next);
}
