import { UniqueConstraintError } from 'sequelize';
import config from '../config/default.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

/** Telegram foydalanuvchisini (bot `ctx.from` yoki Mini App `initData.user`) bazaga yozadi/yangilaydi. */
export async function upsertTelegramUser(tg) {
  const fields = {
    username: tg.username ?? null,
    firstName: tg.first_name,
    lastName: tg.last_name ?? null,
    languageCode: tg.language_code ?? null,
  };
  try {
    const [user, created] = await User.findOrCreate({ where: { telegramId: tg.id }, defaults: fields });
    if (created) logger.info('Yangi foydalanuvchi', { telegramId: tg.id, username: tg.username });
    else if (user.username !== fields.username || user.firstName !== fields.firstName) await user.update(fields);
    return user;
  } catch (err) {
    // Bir vaqtda kelgan ikki so'rov poygasi: allaqachon yaratilgan
    if (err instanceof UniqueConstraintError) return User.findOne({ where: { telegramId: tg.id } });
    throw err;
  }
}

export const isAdmin = (user) => Boolean(user && (user.isAdmin || config.bot.adminIds.includes(user.telegramId)));

/**
 * ADMIN_IDS berilmagan va hali admin yo'q bo'lsa — botga birinchi yozgan odam (bot egasi) admin bo'ladi.
 * Deploydan keyin botni birinchi bo'lib siz ochasiz, shuning uchun bu xavfsiz.
 */
export async function claimOwnershipIfFirst(user) {
  if (config.bot.adminIds.length > 0 || user.isAdmin) return false;
  if ((await User.count({ where: { isAdmin: true } })) > 0) return false;
  await user.update({ isAdmin: true });
  logger.warn('Bot egasi admin qilib belgilandi', { telegramId: user.telegramId });
  return true;
}

export async function getOrderRecipients() {
  if (config.bot.ordersChatId) return [config.bot.ordersChatId];
  const dbAdmins = await User.findAll({ where: { isAdmin: true }, attributes: ['telegramId'] });
  return [...new Set([...config.bot.adminIds, ...dbAdmins.map((u) => u.telegramId)])];
}

/** Bot middleware: foydalanuvchini tekshiradi, bloklanganlarni to'xtatadi. */
export function authMiddleware() {
  return async (ctx, next) => {
    if (!ctx.from || ctx.from.is_bot) return next();
    const user = await upsertTelegramUser(ctx.from);
    if (user.isBanned) {
      logger.info('Bloklangan foydalanuvchi so‘rovi rad etildi', { telegramId: ctx.from.id });
      return;
    }
    ctx.dbUser = user;
    return next();
  };
}

export function adminOnly() {
  return async (ctx, next) => {
    if (isAdmin(ctx.dbUser)) return next();
    logger.warn('Admin bo‘lmagan foydalanuvchi admin amalini urindi', { telegramId: ctx.from?.id });
    if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: 'Ruxsat yo‘q', show_alert: true });
  };
}

/** Oddiy anti-flood: bitta foydalanuvchidan `windowMs` ichida 1 ta update (har bir instansiya uchun). */
export function throttle(windowMs = 700) {
  const lastSeen = new Map();
  return async (ctx, next) => {
    const id = ctx.from?.id;
    if (!id) return next();
    const now = Date.now();
    if (now - (lastSeen.get(id) ?? 0) < windowMs) return;
    lastSeen.set(id, now);
    if (lastSeen.size > 10_000) lastSeen.clear();
    return next();
  };
}
