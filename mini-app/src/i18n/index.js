import uz from './uz.json';
import en from './en.json';
import ru from './ru.json';

export const dictionaries = { uz, en, ru };

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dict);
}

export function translate(lang, key, params = {}) {
  const dict = dictionaries[lang] || dictionaries.uz;
  const raw = resolve(dict, key) ?? resolve(dictionaries.uz, key) ?? key;
  return Object.keys(params).reduce((str, p) => str.replace(new RegExp(`{{${p}}}`, 'g'), params[p]), raw);
}

export function normalizeLang(lang) {
  return ['uz', 'en', 'ru'].includes(lang) ? lang : 'uz';
}
