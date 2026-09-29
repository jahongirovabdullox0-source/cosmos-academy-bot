const uz = require('../bot/i18n/uz.json');
const en = require('../bot/i18n/en.json');
const ru = require('../bot/i18n/ru.json');

const dictionaries = { uz, en, ru };

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

function t(lang, key, params = {}) {
  const dict = dictionaries[lang] || dictionaries.uz;
  const raw = resolve(dict, key) ?? resolve(dictionaries.uz, key) ?? key;
  return Object.keys(params).reduce(
    (str, p) => str.replace(new RegExp(`{{${p}}}`, 'g'), params[p]),
    raw
  );
}

function normalizeLang(lang) {
  return ['uz', 'en', 'ru'].includes(lang) ? lang : 'uz';
}

// titleEn bo'sh bo'lsa titleUz ko'rsatiladi (admin faqat o'zbekchani to'ldirgan bo'lishi mumkin).
function localizedField(entity, field, lang) {
  if (!entity) return '';
  const cap = lang.charAt(0).toUpperCase() + lang.slice(1);
  return entity[`${field}${cap}`] || entity[`${field}Uz`] || '';
}

// duration / workHours: o'zbekcha qiymat asosiy ustunda, tarjimalar En/Ru ustunlarida.
function localizedPlain(entity, field, lang) {
  if (!entity) return '';
  if (lang === 'en') return entity[`${field}En`] || entity[field] || '';
  if (lang === 'ru') return entity[`${field}Ru`] || entity[field] || '';
  return entity[field] || '';
}

module.exports = { t, normalizeLang, dictionaries, localizedField, localizedPlain };
