const { Markup } = require('telegraf');
const { t, localizedField } = require('../services/i18n.service');
const config = require('../config/default');

function mainReplyKeyboard(lang) {
  return Markup.keyboard([
    [t(lang, 'menu.registerButton'), t(lang, 'menu.mockIelts')],
    [t(lang, 'menu.courses'), t(lang, 'menu.results')],
    [t(lang, 'menu.contact'), t(lang, 'menu.language')],
    [t(lang, 'menu.openApp')],
  ]).resize();
}

function languageInlineKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🇺🇿 O'zbekcha", 'lang_uz')],
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
  ]);
}

// Telegram web_app va url tugmalari localhost/HTTP manzillarni rad etadi (butun xabar yuborilmaydi),
// shuning uchun Mini App tugmasi faqat haqiqiy HTTPS manzil (ngrok yoki production) bo'lganda qo'shiladi.
function webAppButton(lang, path = '') {
  if (!config.webappUrl.startsWith('https://')) return null;
  return Markup.button.webApp(t(lang, 'menu.openAppButton'), `${config.webappUrl}${path}`);
}

function openAppInlineKeyboard(lang, path = '') {
  const button = webAppButton(lang, path);
  return button ? Markup.inlineKeyboard([[button]]) : {};
}

function coursesListKeyboard(lang) {
  const row = [Markup.button.callback(t(lang, 'menu.registerButton'), 'reg_start')];
  const appButton = webAppButton(lang, '#/courses');
  return Markup.inlineKeyboard(appButton ? [row, [appButton]] : [row]);
}

// "A1 — Boshlang'ich daraja" -> "A1": ikki ustunli tugmalarda qisqa nom sig'adi.
function shortTitle(course, lang) {
  return localizedField(course, 'title', lang).split(' — ')[0].trim();
}

function courseChoiceKeyboard(courses, lang) {
  const buttons = courses.map((c) => Markup.button.callback(`${c.icon} ${shortTitle(c, lang)}`, `reg_c_${c.id}`));
  const rows = [];
  for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
  rows.push([Markup.button.callback(t(lang, 'flow.cancelButton'), 'reg_cancel')]);
  return Markup.inlineKeyboard(rows);
}

function registerCourseKeyboard(lang, courseId) {
  return Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'menu.registerButton'), `reg_c_${courseId}`)]]);
}

function nameStepKeyboard(lang, suggestion) {
  const rows = [];
  if (suggestion) rows.push([suggestion]);
  rows.push([t(lang, 'flow.cancelButton')]);
  return Markup.keyboard(rows).resize();
}

function phoneStepKeyboard(lang) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(lang, 'flow.shareContactButton'))],
    [t(lang, 'flow.cancelButton')],
  ]).resize();
}

module.exports = {
  mainReplyKeyboard,
  languageInlineKeyboard,
  openAppInlineKeyboard,
  coursesListKeyboard,
  courseChoiceKeyboard,
  registerCourseKeyboard,
  nameStepKeyboard,
  phoneStepKeyboard,
};
