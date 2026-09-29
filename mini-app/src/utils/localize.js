// titleEn/titleRu bo'sh bo'lsa o'zbekchasi ko'rsatiladi (admin faqat o'zbekchani to'ldirgan bo'lishi mumkin).
export function lf(entity, field, lang) {
  if (!entity) return '';
  const cap = lang.charAt(0).toUpperCase() + lang.slice(1);
  return entity[`${field}${cap}`] || entity[`${field}Uz`] || '';
}

// duration / workHours: o'zbekcha qiymat asosiy maydonda, tarjimalar En/Ru maydonlarida.
export function lplain(entity, field, lang) {
  if (!entity) return '';
  if (lang === 'en') return entity[`${field}En`] || entity[field] || '';
  if (lang === 'ru') return entity[`${field}Ru`] || entity[field] || '';
  return entity[field] || '';
}

// "A1 — Boshlang'ich daraja" -> "A1"
export function shortTitle(course, lang) {
  return lf(course, 'title', lang).split(' — ')[0].trim();
}

export const MOCK_CODE = 'MOCK_IELTS';
