// Telegram'ga webhook, buyruqlar va "🍕 Menyu" tugmasini o'rnatadi.
// Vercel'da har bir production build'dan keyin avtomatik ishlaydi; qo'lda: npm run telegram:setup -- https://sayt.uz
import crypto from 'node:crypto';

const token = process.env.BOT_TOKEN?.trim().replace(/^['"]|['"]$/g, '');
const isVercel = Boolean(process.env.VERCEL);
const url =
  process.argv[2] ??
  process.env.WEBAPP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
const apiRoot = process.env.TELEGRAM_API_ROOT ?? 'https://api.telegram.org';

function skip(reason) {
  console.warn(`⚠️  Telegram sozlanmadi: ${reason}`);
  process.exit(0); // build'ni buzmaymiz
}

if (isVercel && process.env.VERCEL_ENV !== 'production') skip('preview deploy');
if (!token) skip('BOT_TOKEN yo‘q');
if (!url?.startsWith('https://')) skip('HTTPS manzil yo‘q');

// Server bilan bir xil formula (src/server/config/default.js)
const secret = crypto.createHash('sha256').update(`webhook:${token}`).digest('hex').slice(0, 48);

async function call(method, body) {
  const res = await fetch(`${apiRoot}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method}: ${json.description ?? res.status}`);
  return json.result;
}

try {
  const me = await call('getMe', {});
  await call('setWebhook', {
    url: `${url}/api/telegram`,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });
  await call('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish' },
      { command: 'orders', description: 'Mening buyurtmalarim' },
      { command: 'myid', description: 'Telegram ID’ni bilish' },
      { command: 'help', description: 'Yordam' },
    ],
  });
  await call('setChatMenuButton', { menu_button: { type: 'web_app', text: '🍕 Menyu', web_app: { url } } });
  console.log(`✅ @${me.username} sozlandi → ${url}`);
} catch (err) {
  // Token xatosi logga tushmasin
  skip(String(err.message).replaceAll(token, '<BOT_TOKEN>'));
}
