import crypto from 'node:crypto';
import config from '../config/default.js';
import logger from '../utils/logger.js';
import { upsertTelegramUser } from './auth.middleware.js';

export class InitDataError extends Error {}

/**
 * Mini App `initData` imzosini tekshiradi:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData, botToken, maxAgeSec) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new InitDataError('hash yo‘q');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest();
  const received = Buffer.from(hash, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new InitDataError('imzo noto‘g‘ri');
  }

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) throw new InitDataError('initData eskirgan');

  const user = JSON.parse(params.get('user') ?? 'null');
  if (!user?.id) throw new InitDataError('user yo‘q');
  return { user, authDate };
}

/** So'rovni tekshiradi: `{ user }` yoki xato `Response` qaytaradi. Header: `Authorization: tma <initData>` */
export async function authenticate(request) {
  const [scheme, initData] = (request.headers.get('authorization') ?? '').split(' ');
  if (scheme !== 'tma' || !initData) return Response.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 });

  let tgUser;
  try {
    tgUser = validateInitData(initData, config.bot.token, config.api.initDataMaxAgeSec).user;
  } catch (err) {
    if (err instanceof InitDataError || err instanceof SyntaxError) {
      logger.warn(`initData rad etildi: ${err.message}`);
      return Response.json({ error: 'initData yaroqsiz' }, { status: 401 });
    }
    throw err;
  }

  const user = await upsertTelegramUser(tgUser);
  if (user.isBanned) return Response.json({ error: 'Siz bloklangansiz' }, { status: 403 });
  return { user };
}
