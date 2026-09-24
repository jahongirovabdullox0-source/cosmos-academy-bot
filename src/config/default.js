require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

function requireEnvWarning(name) {
  if (!process.env[name]) {
    console.warn(`[config] OGOHLANTIRISH: ${name} .env faylida to'ldirilmagan`);
  }
}

['BOT_TOKEN', 'DATABASE_URL', 'ADMIN_PASSWORD', 'ADMIN_SECRET'].forEach(requireEnvWarning);

module.exports = {
  isProd,
  port: parseInt(process.env.PORT, 10) || 4000,

  botToken: process.env.BOT_TOKEN || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',

  webappUrl: (process.env.WEBAPP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  adminPanelUrl: (process.env.ADMIN_PANEL_URL || 'http://localhost:5174').replace(/\/$/, ''),
  renderExternalUrl: (process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, ''),

  databaseUrl: process.env.DATABASE_URL || '',

  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminSecret: process.env.ADMIN_SECRET || '',
  adminAllowRemote: process.env.ADMIN_ALLOW_REMOTE === 'true',

  allowDevAuth: process.env.ALLOW_DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production',

  timezone: 'Asia/Tashkent',
  languages: ['uz', 'en', 'ru'],
  defaultLanguage: 'uz',
};
