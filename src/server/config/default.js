import crypto from 'node:crypto';
import { z } from 'zod';
import { PINNED_BOT_TOKEN, PINNED_DATABASE_URL } from './secrets.js';

const idList = z
  .string()
  .default('')
  .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean).map(Number))
  .pipe(z.array(z.number().int()));

// Nusxalashda tushib qolgan bo'sh joy/qo'shtirnoqlarni olib tashlaydi
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/^['"]|['"]$/g, '') : v);
const optionalStr = z.preprocess((v) => (clean(v) === '' ? undefined : clean(v)), z.string().optional());

/**
 * Neon'dan qanday nusxalansa ham manzilni ajratib oladi: `psql '...'`, `DATABASE_URL=...`,
 * qo'shtirnoqlar, o'rtada qolgan yangi qator/bo'sh joylar (to'g'ri manzilda bo'sh joy bo'lmaydi).
 */
const extractDbUrl = (v) => {
  if (typeof v !== 'string') return v;
  const start = v.search(/postgres(?:ql)?:\/\//);
  if (start < 0) return clean(v);
  let s = v.slice(start);
  const quote = s.search(/['"]/);
  if (quote >= 0) s = s.slice(0, quote);
  return s.replace(/\s+/g, '');
};

/** Nima uchun manzil yaroqsizligini maxfiy qismini ko'rsatmasdan tushuntiradi */
function describeBadDbUrl(raw) {
  if (!/^postgres(?:ql)?:\/\//.test(raw)) return '"postgresql://" bilan boshlanmaydi — Neon → Connect oynasidagi to‘liq manzilni qo‘ying';
  if (!raw.includes('@')) return '"@" belgisi yo‘q — manzil to‘liq nusxalanmagan';
  if (!/@[^/]+\.[a-z]{2,}/i.test(raw) && !/@(localhost|127\.0\.0\.1|db)\b/.test(raw)) return 'server manzili (ep-....neon.tech) yo‘q — manzil oxirigacha nusxalanmagan';
  if (!/@[^/]+\/[^/?]+/.test(raw)) return 'baza nomi (/neondb) yo‘q — manzil oxirigacha nusxalanmagan';
  return `formati noto‘g‘ri (uzunligi ${raw.length} belgi)`;
}

/**
 * postgres URL'ni tekshiradi va tozalaydi. Parolda maxsus belgilar (#, /, ?, @) kodlanmagan bo'lsa ham ishlaydi.
 * sslmode/channel_binding olib tashlanadi — SSL connection.js'da aniq sozlanadi.
 */
function normalizeDbUrl(raw) {
  const finish = (url) => {
    for (const key of ['sslmode', 'channel_binding', 'uselibpqcompat']) url.searchParams.delete(key);
    return url.toString();
  };
  if (/^postgres(?:ql)?:\/\/[^@]+@[^/]+\/[^/?]+/.test(raw)) {
    try {
      return finish(new URL(raw));
    } catch {
      // pastda qo'lda ajratib ko'ramiz
    }
  }
  // user:parol@host/baza — parol oxirgi "@" gacha (maxsus belgilar bo'lishi mumkin)
  const m = raw.match(/^(postgres(?:ql)?):\/\/([^:/@]+):(.*)@([^@/?#]+)\/([^?#/]+)(\?[^#]*)?$/);
  if (m) {
    try {
      const [, scheme, user, password, host, db, query = ''] = m;
      const enc = (x) => encodeURIComponent(decodeURIComponentSafe(x));
      return finish(new URL(`${scheme}://${enc(user)}:${enc(password)}@${host}/${db}${query}`));
    } catch {
      // describeBadDbUrl tushuntiradi
    }
  }
  throw new Error(`DATABASE_URL noto‘g‘ri: ${describeBadDbUrl(raw)}`);
}

function decodeURIComponentSafe(x) {
  try {
    return decodeURIComponent(x);
  } catch {
    return x;
  }
}

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
  const parsed = schema.safeParse({
    ...process.env,
    ...(PINNED_BOT_TOKEN ? { BOT_TOKEN: PINNED_BOT_TOKEN } : {}),
    ...(PINNED_DATABASE_URL ? { DATABASE_URL: PINNED_DATABASE_URL } : {}),
  });
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

  const normalizedDbUrl = normalizeDbUrl(dbUrl);

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
    db: Object.freeze({ url: normalizedDbUrl }),
    api: Object.freeze({ initDataMaxAgeSec: 24 * 60 * 60 }),
    log: Object.freeze({ level: env.LOG_LEVEL, dir: env.LOG_DIR }),
  });
}

const config = loadConfig();
export default config;
