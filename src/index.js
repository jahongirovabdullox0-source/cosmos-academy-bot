const express = require('express');
const cors = require('cors');
const config = require('./config/default');
const { prisma, warmupConnections } = require('./database/connection');
const imageModel = require('./models/image.model');
const { startBot, bot } = require('./core/bot');
const botRoutes = require('./routes/bot.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');

const app = express();

const allowedOrigins = [config.webappUrl, config.adminPanelUrl, 'http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // Telegram WebView ba'zan Origin sarlavhasini yubormaydi yoki har xil bo'ladi
    },
    maxAge: 86400,
    exposedHeaders: ['Content-Disposition'],
  })
);

app.use(express.json({ limit: '2mb' }));

app.use(botRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

app.use('/api', publicRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Render bepul tarifi 15 daqiqa kiruvchi so'rov bo'lmasa serverni uxlatadi va keyingi
// xabar 30-50 soniya kutadi. Server o'z ommaviy manziliga har 10 daqiqada murojaat qilib,
// uyg'oq turadi (bitta xizmat uchun oylik 750 bepul soat yetarli).
function startKeepAlive() {
  if (!config.isProd || !config.renderExternalUrl) return;
  const url = `${config.renderExternalUrl}/api/health`;
  setInterval(() => {
    fetch(url).catch((err) => console.warn('[keep-alive] ping xatosi:', err.message));
  }, 10 * 60_000);
  console.log('[keep-alive] Har 10 daqiqada uyg\'otish yoqildi');
}

// Telegram API vaqtincha javob bermasa ham server (Mini App, Admin Panel) ishlashda davom etadi.
async function startBotWithRetry(attempt = 1) {
  try {
    const status = await startBot();
    console.log('[bot] Holat:', status.mode);
    return status;
  } catch (err) {
    const delay = Math.min(60_000, 5_000 * attempt);
    console.error(`[bot] Ishga tushmadi (${attempt}-urinish), ${delay / 1000} soniyadan so'ng qayta urinamiz:`, err.message);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return startBotWithRetry(attempt + 1);
  }
}

async function main() {
  await warmupConnections(5);

  const server = app.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port} portida ishga tushdi (${config.isProd ? 'production' : 'development'})`);
  });

  startKeepAlive();
  if (config.isProd) {
    const runImageCleanup = () => imageModel.cleanupOrphans().catch((err) => console.warn('[images] tozalash xatosi:', err.message));
    setTimeout(runImageCleanup, 60_000);
    setInterval(runImageCleanup, 24 * 60 * 60_000);
  }

  let botStatus = { mode: 'starting' };
  startBotWithRetry().then((status) => {
    botStatus = status;
  });

  async function shutdown() {
    console.log('\n[server] To\'xtatilmoqda...');
    if (bot && botStatus.mode === 'polling') {
      bot.stop('SIGTERM');
    }
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[server] Ishga tushirishda xatolik:', err);
  process.exit(1);
});
