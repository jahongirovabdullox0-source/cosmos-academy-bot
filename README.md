# Cosmos Academy — Telegram bot, Mini App va Admin Panel

"Cosmos Academy" ingliz tili o'quv markazi uchun Telegram bot, Mini App (mobil ilova) va Admin Panel.

## Tuzilma

```
src/            — Backend (Node.js + Express + Telegraf)
prisma/         — Baza sxemasi va boshlang'ich ma'lumotlar (seed)
mini-app/       — Mini App (React + Vite) — foydalanuvchilar uchun
admin-panel/    — Admin Panel (React + Vite) — markaz xodimlari uchun
scripts/dev.js  — Barcha qismlarni bitta buyruq bilan ishga tushiradi
```

## Imkoniyatlar

- **3 tilda** (o'zbek, ingliz, rus) — foydalanuvchi tilni tanlaydi, bot va Mini App shu tilda ishlaydi
- Kurslar ro'yxati, narxlari va ro'yxatdan o'tish (A1, A2, CEFR Multilevel, IELTS Foundation, Mock IELTS)
- Markaz yutuqlari/natijalari
- Aloqa ma'lumotlari (telefon, manzil, ijtimoiy tarmoqlar)
- Admin panel: arizalarni boshqarish, kurslarni tahrirlash, yutuqlarni tahrirlash, markaz ma'lumotlarini tahrirlash, foydalanuvchilarni ko'rish, hammaga xabar yuborish, Excel eksport

## Lokalda ishga tushirish

1. `.env` faylida `BOT_TOKEN` va `DATABASE_URL`/`DIRECT_URL` to'ldirilgan bo'lishi kerak.
2. Birinchi marta:
   ```bash
   npm install
   npm run mini-app:install
   npm run admin-panel:install
   npm run db:push
   npm run db:seed
   ```
3. Keyinchalik, har safar ishga tushirish uchun `start.bat` faylini ikki marta bosing (yoki `npm run dev`).
4. Ochiladigan manzillar:
   - Backend/API: http://localhost:4000
   - Mini App: http://localhost:5173
   - Admin Panel: http://localhost:5174 (parol `.env` dagi `ADMIN_PASSWORD`)

Telefonda haqiqiy Telegram orqali sinash uchun: `node scripts/dev.js --tunnel` (ngrok kerak).

## Admin panelda nimalarni o'zgartirish mumkin

- **Kurslar**: nomi (3 tilda), tavsifi (3 tilda), narxi, davomiyligi, holati (faol/faol emas), tartib raqami
- **Yutuqlar**: qiymati (masalan "500+"), sarlavhasi (3 tilda), tavsifi, rasm havolasi
- **Markaz ma'lumotlari**: nomi, markaz haqida matn, telefon raqamlari, manzil, ish vaqti, ijtimoiy tarmoq havolalari
- **Arizalar**: holatini o'zgartirish (Yangi/Bog'lanildi/Tasdiqlandi/Bekor qilindi), izoh qo'shish, Excel'ga yuklab olish
- **Foydalanuvchilar**: ko'rish, bloklash/blokdan chiqarish
- **Xabar yuborish**: barcha foydalanuvchilarga bir vaqtda xabar

Joylashtirish (production'ga chiqarish) bo'yicha ko'rsatmalar `DEPLOY.md` faylida.
