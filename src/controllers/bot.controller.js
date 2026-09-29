const { bot, getSafeSecretToken } = require('../core/bot');

function webhookHandler(req, res) {
  if (!bot) {
    res.status(503).json({ success: false, message: 'Bot ishga tushirilmagan' });
    return;
  }

  const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
  if (secretHeader !== getSafeSecretToken()) {
    res.status(401).end();
    return;
  }

  // Telegram'ga darhol 200 qaytaramiz: sekin javoblarda (masalan, sertifikat rasmlari)
  // Telegram so'rovni kutib qolmaydi va xabarni qayta yubormaydi (ikki marta javob bo'lmaydi).
  res.status(200).end();
  bot.handleUpdate(req.body).catch((err) => {
    console.error('[bot] Webhook update xatosi:', err);
  });
}

module.exports = { webhookHandler };
