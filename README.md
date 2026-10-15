# 🍕 Telegram Pizza bot + Mini App

Bitta Next.js loyiha: Telegram bot (grammY, webhook) + Mini App (sayt) + REST API.
Bepul ishlaydi: **Vercel** (hosting) + **Neon** (PostgreSQL).

## Deploy (Vercel)

1. vercel.com → GitHub bilan kiring → **Add New → Project** → shu repo'ni **Import** qiling.
2. **Environment Variables** ga ikkita qiymat qo'shing:
   - `BOT_TOKEN` — @BotFather bergan token
   - `DATABASE_URL` — Neon → Connect → connection string (`postgresql://...`)
3. **Deploy** tugmasini bosing. Build tugagach bot avtomatik sozlanadi
   (webhook, buyruqlar, "🍕 Menyu" tugmasi).
4. Telegram'da botingizga `/start` yozing — **birinchi yozgan odam admin bo'ladi** va buyurtmalar unga keladi.

Ixtiyoriy o'zgaruvchilar: `ADMIN_IDS` (vergul bilan), `ORDERS_CHAT_ID` (buyurtmalar guruhga borishi uchun).

## Tuzilma

```
src/
├── app/                 # Next.js: sahifa + API route'lar
│   └── api/             # /products, /orders, /orders/my, /telegram (webhook)
├── components/ hooks/ lib/ providers/ store/ styles/   # Mini App
└── server/              # Bot backend
    ├── config/          # .env tekshiruvi (zod)
    ├── core/            # Bot instansiyasi, global xato handleri
    ├── database/        # Sequelize + PostgreSQL (Neon)
    ├── models/          # User, Product, Order
    ├── controllers/     # start, savat hisob-kitobi, buyurtmalar
    ├── routes/          # bot handlerlari + API handlerlari
    ├── middlewares/     # auth, initData imzosi, rate-limit
    └── utils/           # klaviaturalar, logger, formatlash
scripts/setup-telegram.mjs   # webhook/buyruqlarni o'rnatish (build'dan keyin avtomatik)
```

## Xavfsizlik

- Webhook maxfiy kalit bilan himoyalangan — Telegram'dan kelmagan so'rovlar 401 oladi.
- Mini App so'rovlari `initData` imzosi (HMAC-SHA256) bilan tekshiriladi.
- Narx faqat serverda hisoblanadi; kiruvchi ma'lumotlar zod bilan tekshiriladi.
- Bot tokeni loglarda avtomatik yashiriladi.

## Lokal ishga tushirish

```bash
cp .env.example .env.local     # BOT_TOKEN, DATABASE_URL, WEBAPP_URL (https tunnel)
npm install && npm run dev
npm run telegram:setup -- https://<tunnel-manzil>
```
