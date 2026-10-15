import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import config from '../config/default.js';

// Maxfiy qiymatlar logga hech qachon tushmasligi kerak (grammY xatolari URL ichida tokenni ko'rsatadi)
const SECRETS = [config.bot.token, config.bot.webhookSecret].filter(Boolean);

function scrub(value, depth = 0) {
  if (typeof value === 'string') return SECRETS.reduce((s, secret) => s.replaceAll(secret, '<SECRET>'), value);
  if (depth > 5 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = scrub(v, depth + 1);
  return out;
}

const redact = winston.format((info) => {
  for (const key of Object.keys(info)) info[key] = scrub(info[key]);
  info.message = scrub(info.message);
  return info;
});

const transports = [
  new winston.transports.Console({
    format: winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} ${level.toUpperCase()}: ${message}${extra}${stack ? `\n${stack}` : ''}`;
    }),
  }),
];

if (config.log.dir) {
  fs.mkdirSync(config.log.dir, { recursive: true });
  for (const [file, level] of [['app.log', undefined], ['error.log', 'error']]) {
    transports.push(
      new winston.transports.File({
        filename: path.join(config.log.dir, file),
        level,
        format: winston.format.json(),
        maxsize: 5_242_880,
        maxFiles: 5,
      }),
    );
  }
}

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(winston.format.errors({ stack: true }), redact(), winston.format.timestamp()),
  transports,
});

export default logger;
