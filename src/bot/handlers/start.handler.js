const userModel = require('../../models/user.model');
const { t, normalizeLang } = require('../../services/i18n.service');
const { mainReplyKeyboard, languageInlineKeyboard } = require('../keyboards');

async function startHandler(ctx) {
  const { user, isNew } = await userModel.findOrCreateFromTelegram(ctx.from);

  if (isNew) {
    await ctx.reply(t('uz', 'welcome.chooseLanguage'), languageInlineKeyboard());
    return;
  }

  const lang = normalizeLang(user.language);
  const name = user.firstName || ctx.from.first_name || '';
  await ctx.reply(t(lang, 'welcome.backAgain', { name }), {
    parse_mode: 'HTML',
    ...mainReplyKeyboard(lang),
  });
}

module.exports = { startHandler };
