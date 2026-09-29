export function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// O'zbekistonda yozgi vaqt yo'q — Toshkent doim UTC+5.
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, '0');

// "2026-09-29" -> "29.09.2026"
export function formatDay(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}.${m}.${y}`;
}

// ISO sana -> Toshkent vaqti bo'yicha "29.09.2026 11:40"
export function formatDateTime(iso) {
  const t = new Date(new Date(iso).getTime() + TASHKENT_OFFSET_MS);
  return `${pad(t.getUTCDate())}.${pad(t.getUTCMonth() + 1)}.${t.getUTCFullYear()} ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
}

// ISO sana -> "29.09.2026"
export function formatDate(iso) {
  return formatDateTime(iso).slice(0, 10);
}

// "+998901234567" -> "+998 90 123 45 67"
export function formatPhone(phone) {
  const match = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone || '');
  return match ? `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone || '';
}

// Telefonda olingan sertifikat rasmlari 3-8 MB bo'ladi. Yuklashdan oldin brauzerning o'zida
// kichraytiramiz (eng uzun tomoni 1600px, JPEG) — Mini App va bot tez ochilishi uchun.
export function compressImage(file, maxSide = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Rasmni qayta ishlab bo'lmadi"))), 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bu faylni rasm sifatida ochib bo'lmadi. JPG yoki PNG tanlang."));
    };
    img.src = url;
  });
}
