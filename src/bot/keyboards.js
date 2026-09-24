const { Markup } = require('telegraf');
const { t } = require('../services/i18n.service');
const config = require('../config/default');

function mainReplyKeyboard(lang) {
  return Markup.keyboard([
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

function openAppInlineKeyboard(lang, path = '') {
  // Telegram web_app VA oddiy url tugmalari ham localhost/HTTP manzillarni rad etadi
  // (butun xabar yuborilmay qoladi). Lokalda (ngrok'siz) tugmasiz, faqat matn yuboramiz;
  // WEBAPP_URL haqiqiy HTTPS (ngrok yoki production) bo'lganda tugma qo'shiladi.
  if (!config.webappUrl.startsWith('https://')) {
    return {};
  }
  const url = `${config.webappUrl}${path}`;
  const label = t(lang, 'menu.openAppButton');
  return Markup.inlineKeyboard([[Markup.button.webApp(label, url)]]);
}

module.exports = { mainReplyKeyboard, languageInlineKeyboard, openAppInlineKeyboard };
