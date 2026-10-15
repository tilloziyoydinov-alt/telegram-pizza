import { Bot, GrammyError, HttpError } from 'grammy';
import config from '../config/default.js';
import logger from '../utils/logger.js';

export function createBot() {
  const bot = new Bot(config.bot.token, config.bot.apiRoot ? { client: { apiRoot: config.bot.apiRoot } } : undefined);

  // Handlerlarda ushlanmagan barcha xatolar shu yerga keladi
  bot.catch(async ({ ctx, error }) => {
    const meta = { updateId: ctx.update.update_id, userId: ctx.from?.id };
    if (error instanceof GrammyError) logger.error(`Telegram API xatosi: ${error.description}`, meta);
    else if (error instanceof HttpError) logger.error(`Telegram'ga ulanib bo'lmadi: ${error.message}`, meta);
    else logger.error(error instanceof Error ? error : new Error(String(error)), meta);

    try {
      if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: '⚠️ Xatolik yuz berdi', show_alert: true });
      else await ctx.reply('⚠️ Kutilmagan xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.');
    } catch {
      logger.warn('Foydalanuvchiga xato haqida xabar yuborib bo‘lmadi', meta);
    }
  });

  return bot;
}

export const BOT_COMMANDS = [
  { command: 'start', description: 'Botni ishga tushirish' },
  { command: 'orders', description: 'Mening buyurtmalarim' },
  { command: 'myid', description: 'Telegram ID’ni bilish' },
  { command: 'help', description: 'Yordam' },
];
