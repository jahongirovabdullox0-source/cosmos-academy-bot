const { Telegraf } = require('telegraf');
const crypto = require('crypto');
const config = require('../config/default');
const { dictionaries, t } = require('../services/i18n.service');
const { startHandler } = require('../bot/handlers/start.handler');
const { languageCallbackHandler, languageButtonHandler } = require('../bot/handlers/language.handler');
const { coursesHandler, resultsHandler, contactHandler, openAppHandler } = require('../bot/handlers/menu.handler');
const { fallbackTextHandler } = require('../bot/handlers/text.handler');

const COMMAND_KEYS = ['start', 'til', 'kurslar', 'natijalar', 'aloqa', 'app'];

if (!config.botToken) {
  console.warn('[bot] OGOHLANTIRISH: BOT_TOKEN topilmadi — bot ishga tushirilmaydi. .env faylini to\'ldiring.');
}

const bot = config.botToken ? new Telegraf(config.botToken) : null;

function labelsFor(key) {
  return Object.values(dictionaries)
    .map((dict) => key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dict))
    .filter(Boolean);
}

if (bot) {
  bot.command('start', startHandler);
  bot.command('til', languageButtonHandler);
  bot.command('kurslar', coursesHandler);
  bot.command('natijalar', resultsHandler);
  bot.command('aloqa', contactHandler);
  bot.command('app', openAppHandler);

  bot.action(['lang_uz', 'lang_en', 'lang_ru'], languageCallbackHandler);

  bot.hears(labelsFor('menu.courses'), coursesHandler);
  bot.hears(labelsFor('menu.results'), resultsHandler);
  bot.hears(labelsFor('menu.contact'), contactHandler);
  bot.hears(labelsFor('menu.language'), languageButtonHandler);
  bot.hears(labelsFor('menu.openApp'), openAppHandler);

  bot.on('text', fallbackTextHandler);

  bot.catch((err, ctx) => {
    console.error(`[bot] Xatolik (update ${ctx.update?.update_id}):`, err);
  });
}

async function setupCommands() {
  if (!bot) return;
  for (const lang of config.languages) {
    const commands = COMMAND_KEYS.map((cmd) => ({ command: cmd, description: t(lang, `commands.${cmd}`) }));
    await bot.telegram.setMyCommands(commands, { language_code: lang });
  }
  const defaultCommands = COMMAND_KEYS.map((cmd) => ({ command: cmd, description: t(config.defaultLanguage, `commands.${cmd}`) }));
  await bot.telegram.setMyCommands(defaultCommands);
}

async function setupMenuButton() {
  if (!bot) return;
  // Telegram menyu tugmasi uchun web_app turi faqat HTTPS manzilni qabul qiladi.
  // Lokalda (ngrok'siz) http://localhost bo'lsa, standart "commands" menyusida qoldiramiz.
  if (!config.webappUrl.startsWith('https://')) {
    console.log('[bot] WEBAPP_URL HTTPS emas — menyu tugmasi web_app turida o\'rnatilmadi (lokal rejim).');
    return;
  }
  await bot.telegram.setChatMenuButton({
    menuButton: { type: 'web_app', text: 'Mini App', web_app: { url: config.webappUrl } },
  });
}

function getWebhookPath() {
  return `/webhook/${crypto.createHash('sha256').update(config.botToken || 'no-token').digest('hex').slice(0, 32)}`;
}

async function startBot() {
  if (!bot) return { mode: 'disabled' };

  await setupCommands();
  await setupMenuButton();

  if (config.renderExternalUrl) {
    const webhookPath = getWebhookPath();
    await bot.telegram.setWebhook(`${config.renderExternalUrl}${webhookPath}`, {
      secret_token: config.webhookSecret || undefined,
    });
    console.log(`[bot] Webhook rejimida ishga tushdi: ${config.renderExternalUrl}${webhookPath}`);
    return { mode: 'webhook', webhookPath };
  }

  const info = await bot.telegram.getWebhookInfo();
  if (info.url) {
    console.log(`[bot] Diqqat: serverda webhook faol (${info.url}). Lokal bot polling rejimida ISHGA TUSHIRILMAYDI, ikkilanish oldini olish uchun.`);
    return { mode: 'remote-webhook-active' };
  }

  // Diqqat: bot.launch() bot to'xtatilmaguncha promise'ni yakunlamaydi (Telegraf'ning
  // atayin qilingan xatti-harakati) — shuning uchun uni "await" qilmaymiz, aks holda
  // server hech qachon ishga tushib bo'lmaydi.
  bot.launch().catch((err) => {
    console.error('[bot] Polling ishga tushishida xatolik:', err);
  });
  console.log('[bot] Polling rejimida ishga tushdi');
  return { mode: 'polling' };
}

module.exports = { bot, startBot, getWebhookPath };
