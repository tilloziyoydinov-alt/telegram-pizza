/**
 * GET /api/health — o'z-o'zini tekshirish sahifasi (maxfiy ma'lumotlarsiz).
 * Konfiguratsiya, ma'lumotlar bazasi va Telegram webhook holatini ko'rsatadi;
 * webhook noto'g'ri bo'lsa — avtomatik qayta o'rnatadi.
 */
const message = (err) => String(err?.message ?? err).replace(/postgres(?:ql)?:\/\/\S+/g, '<DATABASE_URL>');

export async function healthReport() {
  const report = {};
  let config;
  try {
    config = (await import('../config/default.js')).default;
    report.config = '✅ OK';
    report.webAppUrl = config.webAppUrl;
  } catch (err) {
    report.config = `❌ ${message(err)}`;
    return { ok: false, report };
  }
  const scrub = (err) => message(err).replaceAll(config.bot.token, '<BOT_TOKEN>');

  try {
    const { ensureDatabase, Product } = await import('../models/index.js');
    await ensureDatabase();
    report.database = `✅ OK (${await Product.count()} ta mahsulot)`;
  } catch (err) {
    report.database = `❌ ${scrub(err)}`;
  }

  try {
    const { getBot } = await import('./bot.routes.js');
    const { BOT_COMMANDS } = await import('../core/bot.js');
    const api = getBot().api;
    const me = await api.getMe();
    report.bot = `✅ @${me.username}`;

    const expected = `${config.webAppUrl}/api/telegram`;
    let info = await api.getWebhookInfo();
    if (info.url !== expected) {
      await api.setWebhook(expected, {
        secret_token: config.bot.webhookSecret,
        allowed_updates: ['message', 'callback_query'],
      });
      await api.setMyCommands(BOT_COMMANDS);
      await api.setChatMenuButton({
        menu_button: { type: 'web_app', text: '🍕 Menyu', web_app: { url: config.webAppUrl } },
      });
      info = await api.getWebhookInfo();
      report.webhookFixed = '🔧 Webhook qayta o‘rnatildi';
    }
    report.webhook = info.url === expected ? '✅ OK' : `❌ ${info.url || 'o‘rnatilmagan'}`;
    if (info.last_error_message) report.webhookLastError = info.last_error_message;
    if (info.pending_update_count) report.pendingUpdates = info.pending_update_count;
  } catch (err) {
    report.bot = `❌ ${scrub(err)}`;
  }

  const ok = Object.values(report).every((v) => typeof v !== 'string' || !v.startsWith('❌'));
  return { ok, report };
}
