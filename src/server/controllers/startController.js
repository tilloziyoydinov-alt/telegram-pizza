import { claimOwnershipIfFirst } from '../middlewares/auth.middleware.js';
import { escapeHtml } from '../utils/format.js';
import { menuKeyboard } from '../utils/keyboards.js';

const HELP_TEXT = [
  '<b>Qanday buyurtma beriladi?</b>',
  '1. «🍕 Menyuni ochish» tugmasini bosing',
  '2. Pitsalarni savatga qo‘shing',
  '3. Telefon va manzilni kiriting — tayyor!',
  '',
  '/orders — buyurtmalaringiz holati',
].join('\n');

export async function start(ctx) {
  const name = escapeHtml(ctx.from.first_name);
  await ctx.reply(`Assalomu alaykum, <b>${name}</b>! 🍕\nEng mazali pitsalar bir bosishda.`, {
    parse_mode: 'HTML',
    reply_markup: menuKeyboard(),
  });
  if (await claimOwnershipIfFirst(ctx.dbUser)) {
    await ctx.reply(
      '👑 Siz bot egasi (admin) sifatida belgilandingiz. Yangi buyurtmalar shu yerga keladi va ularni tugmalar orqali boshqarasiz.',
    );
  }
}

export async function help(ctx) {
  await ctx.reply(HELP_TEXT, { parse_mode: 'HTML', reply_markup: menuKeyboard() });
}

/** /myid — ADMIN_IDS ga yozish uchun o'z ID'ingizni bilib olish */
export async function myId(ctx) {
  await ctx.reply(`Sizning Telegram ID: <code>${ctx.from.id}</code>\nChat ID: <code>${ctx.chat.id}</code>`, {
    parse_mode: 'HTML',
  });
}

export async function fallback(ctx) {
  await ctx.reply('Buyurtma berish uchun menyuni oching 👇', { reply_markup: menuKeyboard() });
}
