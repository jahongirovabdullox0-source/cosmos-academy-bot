const { t } = require('../../services/i18n.service');
const { mainReplyKeyboard, openAppInlineKeyboard } = require('../keyboards');
const { getUserLang } = require('./menu.handler');

async function fallbackTextHandler(ctx) {
  const lang = await getUserLang(ctx);
  await ctx.reply(t(lang, 'fallback.text'), { ...mainReplyKeyboard(lang) });
  await ctx.reply(t(lang, 'menu.openApp'), openAppInlineKeyboard(lang));
}

module.exports = { fallbackTextHandler };
