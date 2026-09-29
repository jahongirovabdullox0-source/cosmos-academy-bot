const userModel = require('../../models/user.model');
const { t, normalizeLang } = require('../../services/i18n.service');
const { escapeHtml } = require('../../utils/format.util');
const { mainReplyKeyboard, languageInlineKeyboard } = require('../keyboards');

const LANG_MAP = { lang_uz: 'uz', lang_en: 'en', lang_ru: 'ru' };

async function languageCallbackHandler(ctx) {
  const lang = LANG_MAP[ctx.callbackQuery.data];
  if (!lang) return ctx.answerCbQuery();

  await userModel.findOrCreateFromTelegram(ctx.from);
  const user = await userModel.setLanguage(ctx.from.id, lang);

  await ctx.answerCbQuery(t(lang, 'language.changed'));
  await ctx.deleteMessage().catch(() => {});

  const name = escapeHtml(user.firstName || ctx.from.first_name || '');
  await ctx.reply(t(lang, 'welcome.greeting', { name }), {
    parse_mode: 'HTML',
    ...mainReplyKeyboard(lang),
  });
  return undefined;
}

async function languageButtonHandler(ctx) {
  const lang = normalizeLang(await userModel.getLanguage(ctx.from.id));
  await ctx.reply(t(lang, 'language.prompt'), languageInlineKeyboard());
}

module.exports = { languageCallbackHandler, languageButtonHandler };
