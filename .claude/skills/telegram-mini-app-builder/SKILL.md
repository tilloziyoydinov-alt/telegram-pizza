---
name: telegram-mini-app-builder
description: Builds sales-ready Telegram bots with Mini Apps (delivery, shop, booking, courses, services) end-to-end — discovery interview with suggestive options, competitor research with links, design/media/animation proposals, admin profile, code, and free deploy (Vercel frontend + Render backend, Neon DB). Use this skill whenever the user wants to create, redesign or sell a Telegram bot, Mini App, Web App, "telegram dastavka", "bot yasash", "mini app qilish", a client order for a bot, or mentions BotFather tokens, Telegram shops/menus/booking — even if they don't say "skill" or give full requirements.
---

# Telegram Mini App Builder

Goal: the user (a beginner who teaches and sells bots to clients) should be able to sit with a client, answer your questions in ~10 minutes, and have a **working, deployed, sales-oriented bot + Mini App within 20–30 minutes**. Speed comes from asking smart questions once, proposing instead of interrogating, and building on a proven template instead of writing from zero.

Talk to the user in **Uzbek** (simple words, no jargon; explain any unavoidable term in one short phrase). Keep your own messages short: they read on a phone, often next to a client.

## Workflow (follow in order)

### 1. Discovery interview — propose, don't interrogate
Read `references/discovery.md` and send **one message** with the question blocks. Every question offers 2–4 concrete lettered options *with your recommendation marked ⭐*, phrased as proposals: "Shunday qilsak bo'ladimi?" The user may answer with codes like `1a 2⭐ 3c`. If the business type is already known, pre-fill obvious answers and only ask what is truly open.

Add **2–3 fresh ideas** tailored to their business that increase sales (see the idea bank in `references/discovery.md`). Ideas must be implementable in the time budget; label each `⚡ tez` (fits the 30-min path) or `🧩 keyin` (phase 2).

### 2. Research strong examples (when useful or asked)
Read `references/benchmarks.md`. Give 3–5 links to strong Mini Apps/bots in the same niche, each with one line "nimasi yaxshi" (what to borrow). If web access works, search for fresh ones and **verify each link opens** before sending — never invent bot usernames. If web is blocked, give the verified list from the file and say it may be outdated.

### 3. Design, media and animation proposal
Read `references/media-animation.md`. Propose: color palette (3 colors with hex), font, layout style, and for product images ask "faqat rasm yoki animatsion?" offering concrete animation styles (with where to get the assets). Show it as a short "Dizayn taklifi" block and wait for "ok" or edits.

### 4. Admin profile
Ask for the admin's data (name, Telegram username/ID — tell them to send `/myid` to the bot after deploy, phone for order calls, work hours, delivery zones/fees if relevant) and how they want to receive orders (bot message with buttons, admin web panel, Telegram group). Never ask for passwords or tokens in chat.

### 5. Secrets (never in chat)
Explain step by step how to get: BotFather token, Neon connection strings (pooled + direct). They paste these **only** into Render/Vercel environment variables (or a local `.env`). If they paste a secret into chat anyway, use it only where needed, never echo it back, and remind them to rotate it after launch.

### 6. Build
Read `references/build-spec.md` and follow it exactly (stack, folder structure, security MUSTs, deploy rules). Fast path first: reuse the proven template (see build-spec "Fast path"), change branding/products/texts/flow, then add `⚡` ideas. Run builds/tests yourself, fix errors silently, report each phase in ≤5 lines.

### 7. Deploy + handover
Give click-by-click steps (Render → Vercel → env vars → `/health` check → `/start`). After launch, give the user a short **client handover card** (bot link, admin access, how to change products/prices, what to do if the bot is silent: open `/health`).

## Principles
- **Sales first.** Every screen should push toward checkout: clear prices, big CTA, upsell in cart, reorder button, social proof. Fewer taps beats more features.
- **Propose a default for everything.** Beginners decide faster between 3 options than from a blank page; a ⭐ default lets them just say "ok".
- **Security is not optional** even for lessons: secrets in env, `.gitignore` first, Telegram initData validation, server-side prices. The cost of a leaked token or fake-price order is real money for their client.
- **Honest status.** Say what was tested and what wasn't. If something can't be done in 30 minutes, put it in "keyin" instead of half-building it.
- **Token economy.** Output only changed files, no repeated code, no long explanations unless asked.
