import crypto from 'node:crypto';
import { z } from 'zod';

const idList = z
  .string()
  .default('')
  .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean).map(Number))
  .pipe(z.array(z.number().int()));

// Nusxalashda tushib qolgan bo'sh joy/qo'shtirnoqlarni olib tashlaydi
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/^['"]|['"]$/g, '') : v);
const optionalStr = z.preprocess((v) => (clean(v) === '' ? undefined : clean(v)), z.string().optional());

/** Neon "Connect" oynasidan `psql 'postgresql://...'` ko'rinishida nusxalansa ham manzilni ajratib oladi */
const extractDbUrl = (v) => (typeof v === 'string' ? (v.match(/postgres(?:ql)?:\/\/[^\s'"]+/)?.[0] ?? clean(v)) : v);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOT_TOKEN: z.preprocess(clean, z.string().regex(/^\d+:[\w-]{30,}$/, 'BOT_TOKEN formati noto‘g‘ri')),
  // Bo'sh bo'lsa — botga birinchi /start yozgan odam admin bo'ladi
  ADMIN_IDS: idList,
  ORDERS_CHAT_ID: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().optional()),
  // Vercel o'zi beradi: VERCEL_PROJECT_PRODUCTION_URL. Boshqa joyda — WEBAPP_URL
  WEBAPP_URL: optionalStr,
  VERCEL_PROJECT_PRODUCTION_URL: optionalStr,
  // Vercel + Neon integratsiyasi DATABASE_URL (yoki POSTGRES_URL) ni avtomatik qo'shadi
  DATABASE_URL: z.preprocess(extractDbUrl, optionalStr),
  POSTGRES_URL: z.preprocess(extractDbUrl, optionalStr),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // Faqat doimiy diskli serverda (Vercel'da fayl tizimi faqat o'qish uchun)
  LOG_DIR: optionalStr,
  // Faqat testlar uchun: Telegram API o'rniga soxta server
  TELEGRAM_API_ROOT: optionalStr,
});

function loadConfig() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Konfiguratsiya xatosi: ${issues}`);
  }
  const env = parsed.data;

  const webAppUrl =
    env.WEBAPP_URL ?? (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  if (!webAppUrl?.startsWith('https://')) throw new Error('Konfiguratsiya xatosi: WEBAPP_URL (HTTPS) topilmadi');

  const dbUrl = env.DATABASE_URL ?? env.POSTGRES_URL;
  if (!dbUrl) throw new Error('Konfiguratsiya xatosi: DATABASE_URL topilmadi (Neon ulanish manzilini Vercel → Settings → Environment Variables ga qo‘shing)');

  return Object.freeze({
    isProd: env.NODE_ENV === 'production',
    bot: Object.freeze({
      token: env.BOT_TOKEN,
      adminIds: env.ADMIN_IDS,
      ordersChatId: env.ORDERS_CHAT_ID,
      apiRoot: env.TELEGRAM_API_ROOT,
      // Telegram webhook so'rovlarini tekshirish uchun maxfiy kalit (tokendan hosil qilinadi)
      webhookSecret: crypto.createHash('sha256').update(`webhook:${env.BOT_TOKEN}`).digest('hex').slice(0, 48),
    }),
    webAppUrl,
    db: Object.freeze({ url: dbUrl }),
    api: Object.freeze({ initDataMaxAgeSec: 24 * 60 * 60 }),
    log: Object.freeze({ level: env.LOG_LEVEL, dir: env.LOG_DIR }),
  });
}

const config = loadConfig();
export default config;
