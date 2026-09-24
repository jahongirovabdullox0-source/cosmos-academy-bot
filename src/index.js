const express = require('express');
const cors = require('cors');
const config = require('./config/default');
const { prisma, warmupConnections } = require('./database/connection');
const { startBot, bot } = require('./core/bot');
const botRoutes = require('./routes/bot.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
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

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

async function main() {
  await warmupConnections(5);

  const server = app.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port} portida ishga tushdi (${config.isProd ? 'production' : 'development'})`);
  });

  const botStatus = await startBot();
  console.log('[bot] Holat:', botStatus.mode);

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
