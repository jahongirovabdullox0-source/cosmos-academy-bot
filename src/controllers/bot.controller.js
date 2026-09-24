const { bot } = require('../core/bot');
const config = require('../config/default');

function webhookHandler(req, res) {
  if (!bot) {
    res.status(503).json({ success: false, message: 'Bot ishga tushirilmagan' });
    return;
  }

  const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
  if (config.webhookSecret && secretHeader !== config.webhookSecret) {
    res.status(401).end();
    return;
  }

  bot.handleUpdate(req.body, res).catch((err) => {
    console.error('[bot] Webhook update xatosi:', err);
    if (!res.headersSent) res.status(200).end();
  });
}

module.exports = { webhookHandler };
