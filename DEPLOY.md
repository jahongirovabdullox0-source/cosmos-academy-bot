# Joylashtirish va yangilash

## Qayerda nima turibdi

| Qism | Xizmat | Loyiha nomi |
|---|---|---|
| Backend + bot | Render (bepul, Virginia) | `cosmos-academy-api` |
| Mini App | Vercel | `cosmos-academy-app` |
| Admin Panel | Vercel | `cosmos-academy-admin` |
| Baza | Neon (PostgreSQL, us-east-1) | — |
| Kod | GitHub | `jahongirovabdullox0-source/cosmos-academy-bot` |

## Yangilash

- **Backend/bot**: GitHub'ning `main` tarmog'iga push qilinsa, Render avtomatik qayta joylaydi (1–3 daqiqa). Build vaqtida baza sxemasi ham yangilanadi (`npm run db:deploy`).
- **Mini App va Admin Panel**: Vercel'ga CLI orqali joylanadi (GitHub'ga ulanmagan). CLI 61-versiyasi bu akkauntda "Not authorized" beradi, shuning uchun 59.26.0 ishlatiladi:
  ```bash
  npx --yes vercel@59.26.0 deploy --prod --yes --cwd mini-app
  npx --yes vercel@59.26.0 deploy --prod --yes --cwd admin-panel
  ```
- Faqat hujjat o'zgarsa, commit xabariga `[skip render]` qo'shing — Render qayta joylamaydi.

## Render muhit o'zgaruvchilari

| Nomi | Qiymati |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Neon manzillari (`DIRECT_URL` — host nomida `-pooler` yo'q) |
| `BOT_TOKEN` | @BotFather tokeni |
| `ADMIN_PASSWORD` | Admin panel paroli (kamida 10 belgi) |
| `WEBAPP_URL` | `https://cosmos-academy-app.vercel.app` |
| `ADMIN_PANEL_URL` | `https://cosmos-academy-admin.vercel.app` |
| `WEBHOOK_SECRET`, `ADMIN_SECRET` | Render o'zi yaratgan |

Admin parolini almashtirish: Render → `cosmos-academy-api` → Environment → `ADMIN_PASSWORD` → Save.

## Vercel muhit o'zgaruvchisi

Ikkala Vercel loyihasida: `VITE_API_URL = https://cosmos-academy-api.onrender.com`.
Bu qiymat build vaqtida ichiga yoziladi — o'zgartirilsa, qayta `deploy` qilish kerak.
Windows PowerShell'da qiymatni `|` orqali yubormang (oldiga ko'rinmas BOM belgisi qo'shilib, manzil buziladi) — `cmd /c "echo qiymat| npx vercel env add ..."` ishlating.

## Tezlik (uxlab qolmaslik)

Render bepul tarifi 15 daqiqa so'rov bo'lmasa serverni uxlatadi va keyingi xabar 30–50 soniya kutadi.
Server o'zini har 10 daqiqada chaqirib uyg'oq turadi (`src/index.js` → `startKeepAlive`).
Bitta xizmat uchun oylik 750 bepul soat yetarli. Butunlay kafolatli tezlik kerak bo'lsa — Render "Starter" tarifi (~7$/oy).

## Tekshirish

- `https://cosmos-academy-api.onrender.com/api/health` → `{"success":true,"status":"ok"}`
- Telegram webhook holati: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` — `last_error_message` bo'lmasligi kerak.
