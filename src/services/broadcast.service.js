const { prisma } = require('../database/connection');
const { t, normalizeLang } = require('./i18n.service');
const { escapeHtml } = require('../utils/format.util');

const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendToAll(bot, text) {
  const users = await prisma.user.findMany({
    where: { isBlocked: false },
    select: { telegramId: true, language: true },
  });

  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (user) => {
        const lang = normalizeLang(user.language);
        const message = `${t(lang, 'broadcast.prefix')}${escapeHtml(text)}`;
        try {
          await bot.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
          sentCount += 1;
        } catch (err) {
          failCount += 1;
        }
      })
    );
    if (i + BATCH_SIZE < users.length) await sleep(BATCH_DELAY_MS);
  }

  await prisma.broadcastLog.create({ data: { text, sentCount, failCount } });

  return { sentCount, failCount, total: users.length };
}

async function history(limit = 20) {
  return prisma.broadcastLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
}

module.exports = { sendToAll, history };
