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

module.exports = { t, normalizeLang, dictionaries };
