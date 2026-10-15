import { GrammyError } from 'grammy';
import { Op } from 'sequelize';
import { sequelize } from '../database/connection.js';
import { Order, Product, User } from '../models/index.js';
import { STATUS_LABELS } from '../models/Order.js';
import { getOrderRecipients } from '../middlewares/auth.middleware.js';
import { escapeHtml, formatPrice } from '../utils/format.js';
import { allowedNextStatuses, orderAdminKeyboard } from '../utils/keyboards.js';
import logger from '../utils/logger.js';

export class CartError extends Error {}

/**
 * Savatni server tomonda hisoblaydi. Mijozdan faqat {productId, quantity} olinadi —
 * narx hech qachon mijozdan qabul qilinmaydi (narxni soxtalashtirishdan himoya).
 */
export async function calculateCart(items) {
  const quantities = new Map();
  for (const { productId, quantity } of items) {
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  const products = await Product.findAll({ where: { id: { [Op.in]: [...quantities.keys()] }, isActive: true } });
  if (products.length !== quantities.size) throw new CartError('Savatdagi ba’zi mahsulotlar mavjud emas');

  const lines = products.map((p) => {
    const quantity = quantities.get(p.id);
    return { productId: p.id, name: p.name, price: p.price, quantity, subtotal: p.price * quantity };
  });
  const totalPrice = lines.reduce((sum, l) => sum + l.subtotal, 0);
  return { lines, totalPrice };
}

function formatOrder(order, user) {
  const lines = order.items.map((i) => `• ${escapeHtml(i.name)} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`);
  const customer = user
    ? `👤 ${escapeHtml(user.firstName)}${user.username ? ` (@${escapeHtml(user.username)})` : ''}\n`
    : '';
  return [
    `<b>Buyurtma #${order.id}</b> — ${STATUS_LABELS[order.status]}`,
    '',
    ...lines,
    '',
    `💰 <b>Jami: ${formatPrice(order.totalPrice)}</b>`,
    `${customer}📞 ${escapeHtml(order.phone)}`,
    `📍 ${escapeHtml(order.address)}`,
    order.comment ? `💬 ${escapeHtml(order.comment)}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

async function safeSend(api, chatId, text, extra = {}) {
  try {
    await api.sendMessage(chatId, text, { parse_mode: 'HTML', ...extra });
  } catch (err) {
    // Foydalanuvchi botni bloklagan bo'lsa ham buyurtma saqlanib qoladi
    const reason = err instanceof GrammyError ? err.description : err.message;
    logger.warn(`Xabar yuborilmadi (chat ${chatId}): ${reason}`);
  }
}

/** Mini App'dan kelgan buyurtmani yaratadi va admin/mijozni xabardor qiladi. */
export async function createOrder(api, user, { items, phone, address, comment }) {
  const { lines, totalPrice } = await calculateCart(items);

  const order = await sequelize.transaction(async (transaction) => {
    const created = await Order.create(
      {
        userId: user.id,
        items: lines.map(({ subtotal, ...rest }) => rest),
        totalPrice,
        phone,
        address,
        comment: comment || null,
      },
      { transaction },
    );
    if (user.phone !== phone) await user.update({ phone }, { transaction });
    return created;
  });

  logger.info('Yangi buyurtma', { orderId: order.id, userId: user.telegramId, totalPrice });

  const recipients = await getOrderRecipients();
  if (recipients.length === 0) logger.warn('Admin yo‘q — buyurtma hech kimga yuborilmadi (botga /start yozing)');
  const adminText = formatOrder(order, user);
  await Promise.all([
    ...recipients.map((chatId) =>
      safeSend(api, chatId, adminText, { reply_markup: orderAdminKeyboard(order) }),
    ),
    safeSend(api, user.telegramId, `✅ Buyurtmangiz qabul qilindi!\n\n${formatOrder(order)}`),
  ]);
  return order;
}

export function getUserOrders(userId, limit = 10) {
  return Order.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit });
}

/** /orders */
export async function myOrders(ctx) {
  const orders = await getUserOrders(ctx.dbUser.id, 5);
  if (orders.length === 0) {
    await ctx.reply('Sizda hali buyurtmalar yo‘q. Menyudan tanlang 🍕');
    return;
  }
  await ctx.reply(orders.map((o) => formatOrder(o)).join('\n\n— — —\n\n'), { parse_mode: 'HTML' });
}

/** Admin: `order:<id>:<status>` callback */
export async function changeOrderStatus(ctx) {
  const [, orderId, nextStatus] = ctx.match;
  const order = await Order.findByPk(Number(orderId), { include: { model: User, as: 'user' } });
  if (!order) {
    await ctx.answerCallbackQuery({ text: 'Buyurtma topilmadi', show_alert: true });
    return;
  }
  if (!allowedNextStatuses(order.status).includes(nextStatus)) {
    await ctx.answerCallbackQuery({ text: `Bu amal mumkin emas. Joriy holat: ${STATUS_LABELS[order.status]}` });
    return;
  }

  await order.update({ status: nextStatus });
  logger.info('Buyurtma holati o‘zgardi', { orderId: order.id, status: nextStatus, by: ctx.from.id });

  await ctx.editMessageText(formatOrder(order, order.user), {
    parse_mode: 'HTML',
    reply_markup: orderAdminKeyboard(order),
  });
  await ctx.answerCallbackQuery({ text: STATUS_LABELS[nextStatus] });
  await safeSend(ctx.api, order.user.telegramId, `Buyurtma #${order.id}: <b>${STATUS_LABELS[nextStatus]}</b>`);
}
