const express = require('express');
const { getWebhookPath } = require('../core/bot');
const { webhookHandler } = require('../controllers/bot.controller');

const router = express.Router();

router.post(getWebhookPath(), webhookHandler);

module.exports = router;
