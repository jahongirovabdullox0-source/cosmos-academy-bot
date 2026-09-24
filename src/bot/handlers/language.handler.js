const userModel = require('../../models/user.model');
const { t, normalizeLang } = require('../../services/i18n.service');
const { mainReplyKeyboard, languageInlineKeyboard } = require('../keyboards');

const LANG_MAP = { lang_uz: 'uz', lang_en: 'en', lang_ru: 'ru' };

async function languageCallbackHandler(ctx) {
  const lang = LANG_MAP[ctx.callbackQuery.data];
  if (!lang) return ctx.answerCbQuery();

  await userModel.findOrCreateFromTelegram(ctx.from);
  const user = await userModel.setLanguage(ctx.from.id, lang);

  await ctx.answerCbQuery(t(lang, 'language.changed'));
  try {
    await ctx.deleteMessage();
  } catch {
    // eski tanlov xabarini o'chirib bo'lmasa, muhim emas
  }

  const name = user.firstName || ctx.from.first_name || '';
  await ctx.reply(t(lang, 'welcome.greeting', { name }), {
    parse_mode: 'HTML',
    ...mainReplyKeyboard(lang),
  });
}

async function languageButtonHandler(ctx) {
  const user = await userModel.findByTelegramId(ctx.from.id);
  const lang = user ? normalizeLang(user.language) : 'uz';
  await ctx.reply(t(lang, 'language.prompt'), languageInlineKeyboard());
}

module.exports = { languageCallbackHandler, languageButtonHandler };
