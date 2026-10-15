import pg from 'pg';
import { Sequelize } from 'sequelize';
import config from '../config/default.js';
import logger from '../utils/logger.js';

/**
 * Neon manzilidagi `sslmode`/`channel_binding` parametrlarini olib tashlab, SSL'ni aniq sozlaymiz:
 * sertifikat har doim tekshiriladi (rejectUnauthorized), pg ogohlantirishlari chiqmaydi.
 */
function normalizeUrl(raw) {
  const url = new URL(raw);
  for (const key of ['sslmode', 'channel_binding', 'uselibpqcompat']) url.searchParams.delete(key);
  return url.toString();
}

const dbUrl = normalizeUrl(config.db.url);
const isLocal = ['localhost', '127.0.0.1', 'db'].includes(new URL(dbUrl).hostname);

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectModule: pg, // bundler pg'ni topishi uchun aniq ko'rsatiladi
  logging: (sql) => logger.debug(sql),
  // Serverless: har bir instansiya kam ulanish ochadi (Neon pooler bilan ishlaydi)
  pool: { max: 3, min: 0, idle: 5_000, acquire: 20_000 },
  dialectOptions: isLocal ? {} : { ssl: { rejectUnauthorized: true } },
});

export async function connectDatabase() {
  await sequelize.authenticate();
  // Prod uchun migratsiyalar tavsiya etiladi; boshlang'ich loyiha uchun sync yetarli
  await sequelize.sync();
  logger.info('Database ulandi');
}
