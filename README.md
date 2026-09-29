# Cosmos Academy — Telegram bot, Mini App va Admin Panel

"Cosmos Academy" ingliz tili o'quv markazi uchun Telegram bot, Mini App va Admin Panel.

| Qism | Manzil |
|---|---|
| Bot | https://t.me/CA_uzb_bot |
| Mini App | https://cosmos-academy-app.vercel.app |
| Admin Panel | https://cosmos-academy-admin.vercel.app |
| Backend (API) | https://cosmos-academy-api.onrender.com |

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
- **Botda ro'yxatdan o'tish** (`✍️ Ro'yxatdan o'tish`, `/royxat`): A1–C2, CEFR, IELTS dan birini tanlash → ism-familiya → telefon (bir bosishda yuborish mumkin)
- **Mock IELTS** (`📝 Mock IELTS`, `/mock`): har yakshanba, CD format, 80 000 so'm — alohida ariza
- Kurslar ro'yxati va narxlari, markaz natijalari va **sertifikat rasmlari**, aloqa ma'lumotlari
- Mini App'da ham xuddi shu: ro'yxatdan o'tish (daraja tanlash bilan), Mock IELTS banneri, sertifikatlar galereyasi
- Admin panel: arizalar (kurs bo'yicha filtr, bir bosishda qo'ng'iroq), kurslar, natijalar va sertifikat rasmlari, markaz ma'lumotlari, foydalanuvchilar, hammaga xabar, Excel eksport

## Admin panelda nimalarni o'zgartirish mumkin

- **Arizalar**: holatini o'zgartirish (Yangi/Bog'lanildi/Tasdiqlandi/Bekor qilindi), izoh, kurs bo'yicha filtr, Excel'ga yuklab olish
- **Kurslar**: nomi, tavsifi, davomiyligi (3 tilda — inglizcha/ruscha bo'sh qolsa o'zbekchasi ko'rinadi), narxi, holati, tartibi
- **Natijalar / sertifikatlar**: raqamlar (masalan "500+ bitiruvchi") va sertifikat rasmlari — rasm yuklansa "Sertifikatlar" bo'limida chiqadi
- **Markaz ma'lumotlari**: telefonlar, manzil, ish vaqti (3 tilda), xaritadagi nuqta, ijtimoiy tarmoqlar
- **Foydalanuvchilar**: ko'rish, bloklash (bloklangan odam ariza qoldira olmaydi)
- **Xabar yuborish**: barcha foydalanuvchilarga bir vaqtda xabar

## Lokalda ishga tushirish

1. `.env` faylida `BOT_TOKEN`, `DATABASE_URL`, `DIRECT_URL` to'ldirilgan bo'lishi kerak.
2. Birinchi marta:
   ```bash
   npm install
   npm run mini-app:install
   npm run admin-panel:install
   npm run db:push
   npm run db:seed
   ```
3. Keyinchalik `start.bat` ni ikki marta bosing (yoki `npm run dev`).

Diqqat: lokal server production bilan **bitta bazani** ishlatadi. Serverda webhook yoqilgan bo'lsa, lokal bot xabarlarni qabul qilmaydi (ikkilanmaslik uchun).

Joylashtirish va yangilash bo'yicha ko'rsatmalar — `DEPLOY.md`.
