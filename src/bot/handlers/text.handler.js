const { t } = require('../../services/i18n.service');
const { mainReplyKeyboard } = require('../keyboards');
const { getUserLang } = require('./menu.handler');

async function fallbackTextHandler(ctx) {
  const lang = await getUserLang(ctx);
  await ctx.reply(t(lang, 'fallback.text'), mainReplyKeyboard(lang));
}

module.exports = { fallbackTextHandler };
