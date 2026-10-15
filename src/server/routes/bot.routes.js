import { webhookCallback } from 'grammy';
import config from '../config/default.js';
import { changeOrderStatus, myOrders } from '../controllers/cartController.js';
import { fallback, help, myId, start } from '../controllers/startController.js';
import { createBot } from '../core/bot.js';
import { adminOnly, authMiddleware, throttle } from '../middlewares/auth.middleware.js';
import { ensureDatabase } from '../models/index.js';
import logger from '../utils/logger.js';

/** Barcha bot handlerlarini bitta joyda ro'yxatdan o'tkazadi. Tartib muhim. */
export function registerBotRoutes(bot) {
  bot.use(throttle());
  bot.use(authMiddleware());

  // Guruhda ham ishlaydi — ORDERS_CHAT_ID ni aniqlash uchun.
  // chatType() dan OLDIN: aks holda private chatdagi fallback uni "yutib" yuboradi
  bot.command('myid', myId);

  // Middleware'lardan KEYIN yaratilishi shart, aks holda ular bu handlerlardan oldin ishlamaydi
  const chat = bot.chatType('private');
  chat.command('start', start);
  chat.command('help', help);
  chat.command('orders', myOrders);

  bot.callbackQuery(/^order:(\d+):(\w+)$/, adminOnly(), changeOrderStatus);
  bot.on('callback_query:data', (ctx) => ctx.answerCallbackQuery());
  chat.on('message', fallback);
}

let bot;
/** Har bir serverless instansiyada bitta bot obyekti */
export function getBot() {
  if (!bot) {
    bot = createBot();
    registerBotRoutes(bot);
  }
  return bot;
}

let handler;
/** Telegram webhook: POST /api/telegram */
export async function handleWebhook(request) {
  await ensureDatabase();
  handler ??= webhookCallback(getBot(), 'std/http', {
    secretToken: config.bot.webhookSecret, // Telegram'dan kelmagan so'rovlar 401 oladi
    onTimeout: 'return',
    timeoutMilliseconds: 9_000,
  });
  try {
    return await handler(request);
  } catch (err) {
    logger.error(err instanceof Error ? err : new Error(String(err)));
    // 200 qaytaramiz: aks holda Telegram shu update'ni cheksiz qayta yuboradi
    return new Response(null, { status: 200 });
  }
}
