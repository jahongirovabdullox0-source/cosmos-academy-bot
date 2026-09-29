const userModel = require('../../models/user.model');
const flowState = require('../registrationState');
const { t, normalizeLang } = require('../../services/i18n.service');
const { escapeHtml } = require('../../utils/format.util');
const { mainReplyKeyboard, languageInlineKeyboard } = require('../keyboards');

async function startHandler(ctx) {
  flowState.clear(ctx.from.id);
  const { user, isNew } = await userModel.findOrCreateFromTelegram(ctx.from);

  if (isNew) {
    await ctx.reply(t('uz', 'welcome.chooseLanguage'), languageInlineKeyboard());
    return;
  }

  const lang = normalizeLang(user.language);
  const name = escapeHtml(user.firstName || ctx.from.first_name || '');
  await ctx.reply(t(lang, 'welcome.backAgain', { name }), {
    parse_mode: 'HTML',
    ...mainReplyKeyboard(lang),
  });
}

module.exports = { startHandler };
