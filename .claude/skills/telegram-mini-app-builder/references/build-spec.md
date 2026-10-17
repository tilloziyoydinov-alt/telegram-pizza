# Build spec (stack, structure, rules, deploy)

## Fast path (20–30 min)
If a working template repo is available (user's template, e.g. GitHub `tilloziyoydinov-alt/telegram-pizza`: Next.js + grammY webhook + Sequelize/Neon on one Vercel project, with /api/health, initData auth, admin buttons), clone it into a NEW repo and customize: brand (name, colors, fonts), products/seed, texts, screens, chosen ⚡ ideas. This is the only realistic way to hit 30 minutes. Note: that template deploys backend+frontend together on Vercel; if the client needs the Render split, use the Full path.

## Full path (Render + Vercel)
STACK (fixed): monorepo /backend + /frontend.
- Backend: Node 20, Express, grammY (WEBHOOK), Prisma + Neon PostgreSQL, zod, winston, helmet, cors, express-rate-limit.
- Frontend: Next.js 15 App Router + TS, Zustand; Mini App at /, Admin Panel at /admin. framer-motion if animations chosen; lottie-react if Lottie.
- Deploy (free): backend → Render (fallback Koyeb), frontend → Vercel (fallback Netlify). Images → Cloudinary or Vercel Blob (Render free has no persistent disk).

STRUCTURE (keep names; add one model per entity):
/backend: prisma/{schema.prisma,seed.js}, src/config/default.js, src/core/bot.js, src/database/connection.js, src/models/<Entity>.js, src/controllers/{startController,clientController,adminController}.js, src/routes/{bot,client,admin}.routes.js, src/middlewares/{auth,telegramAuth}.middleware.js, src/utils/{keyboards,logger}.js, src/index.js, render.yaml, .env.example
/frontend: src/app/{layout,page}.tsx, src/app/admin/, src/components/{ui,features,layout}/, src/hooks/{useTelegram,useCart}.ts, src/lib/{api,utils}.ts, src/providers/TelegramProvider.tsx, src/store/, src/styles/globals.css, public/images/, .env.example, next.config.mjs
Root: .gitignore, README.md

## GitHub (Phase 0)
Install GitHub CLI if missing; `gh auth login` (show one-time code + github.com/login/device); connect the repo the user gives; push README.md to main; report ✅. Fallback manual steps: git init → add → commit -m "ilk test" → branch -M main → remote add origin <url>.git → push -u origin main.

## MUST (security & quality)
- FIRST file `.gitignore`: OS files, IDE, node_modules/, .next/, .vercel/, build/ dist/ out/, *.tsbuildinfo, next-env.d.ts, logs/ *.log, `.env` + `.env.*` + `!.env.example`, *.pem *.key, archives. Never add `lib/` (it hides src/lib). Commit lock files. `.env.example` = keys only.
- Secrets only in env, never in code/git/logs/chat; logger redacts the bot token. Before each commit run `git ls-files | grep -iE "\.env|secret"` and stop if anything but .env.example appears.
- Prisma: url = DATABASE_URL (pooled), directUrl = DIRECT_URL; idempotent seed (upsert).
- Validate Telegram initData (HMAC-SHA256, max age 24h) on every client API call; webhook `secret_token`; money computed server-side (client sends only ids + quantities); zod validation; HTML-escape user text in bot messages; tolerant env parsing (trim, accept `psql '...'` snippet, strip sslmode/channel_binding and set SSL explicitly).
- Admin: ADMIN_PASSWORD login → HMAC-signed 12h token on admin routes; bot admin = ADMIN_IDS or first /start user if empty; `/myid` command.
- try/catch everywhere + bot.catch + Express error handler; GET /health reports config, db, bot, webhook and auto-fixes the webhook.
- Register grammY middlewares BEFORE `bot.chatType()` and register `/myid` before the private-chat fallback (otherwise handlers run without auth / are swallowed).
- Mobile-first, Uzbek UI text, Telegram theme vars, MainButton/BackButton/haptics, skeleton loaders, prefers-reduced-motion.

## Deploy rules
- Render (render.yaml, rootDir backend): build `npm ci && npx prisma generate && npx prisma db push && node prisma/seed.js`; start `node src/index.js`; healthCheckPath /health; env: BOT_TOKEN, DATABASE_URL, DIRECT_URL, WEBAPP_URL, ADMIN_PASSWORD, ADMIN_IDS. Webhook = RENDER_EXTERNAL_URL + /telegram/webhook; on start: setWebhook, setMyCommands, setChatMenuButton(WEBAPP_URL).
- Render free sleeps after 15 min: frontend shows "Server uyg'onmoqda…" + retries up to 60 s; suggest cron-job.org ping /health every 10 min.
- Vercel: Root Directory = frontend; env NEXT_PUBLIC_API_URL = Render URL. Backend CORS: only WEBAPP_URL (+ localhost in dev).

## Workflow
Phase 0 GitHub → 1 backend → 2 Mini App → 3 Admin → 4 design & animations → 5 deploy. Each phase: write files, run build/tests yourself, fix errors silently, report ≤5 lines + what the user must click. Ask only when blocked.
Final beginner guide: Render (New → Blueprint, env) → Vercel (Import, Root Directory, env) → paste Vercel URL into Render WEBAPP_URL → open <render-url>/health → /start → /admin.
