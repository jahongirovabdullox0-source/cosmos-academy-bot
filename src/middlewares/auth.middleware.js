const crypto = require('crypto');
const config = require('../config/default');
const { ApiError } = require('../utils/http.util');

const FORWARDED_HEADERS = ['x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host'];

function isDevRequest(req) {
  return !FORWARDED_HEADERS.some((h) => req.headers[h]);
}

function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const pairs = [];
  for (const [key, value] of params.entries()) pairs.push(`${key}=${value}`);
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const authDate = Number(params.get('auth_date') || 0);
  const ageSeconds = Date.now() / 1000 - authDate;
  if (!authDate || ageSeconds > 24 * 60 * 60) return null;

  let user = null;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch {
    user = null;
  }
  return { user, authDate };
}

function telegramAuth(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || '';
  const result = verifyTelegramInitData(initData, config.botToken);

  if (result && result.user && result.user.id) {
    req.telegramUser = result.user;
    return next();
  }

  if (config.allowDevAuth && isDevRequest(req)) {
    req.telegramUser = {
      id: req.headers['x-dev-telegram-id'] || '111111111',
      first_name: 'Dev',
      last_name: 'User',
      username: 'devuser',
      language_code: 'uz',
    };
    return next();
  }

  return next(new ApiError(401, 'Avtorizatsiya muvaffaqiyatsiz: initData yaroqsiz yoki muddati o\'tgan'));
}

// ---------------- Admin panel auth ----------------

const loginAttempts = new Map(); // ip -> { count, windowStart }
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

function isWeakPassword(password) {
  if (!password || password.length < 10) return true;
  if (/^\d+$/.test(password)) return true;
  if (/^(.)\1+$/.test(password)) return true;
  const common = ['password', 'parol123', '12345678', 'qwerty123', 'admin123', 'password1'];
  return common.includes(password.toLowerCase());
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function checkRateLimit(ip) {
  const entry = loginAttempts.get(ip);
  const now = Date.now();
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, windowStart: now });
    return true;
  }
  return entry.count < RATE_LIMIT_MAX;
}

function recordAttempt(ip, success) {
  const entry = loginAttempts.get(ip) || { count: 0, windowStart: Date.now() };
  if (!success) entry.count += 1;
  else entry.count = 0;
  loginAttempts.set(ip, entry);
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(input) {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function issueAdminToken() {
  const payload = { iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const payloadStr = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', config.adminSecret).update(payloadStr).digest('hex');
  return `${payloadStr}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payloadStr, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', config.adminSecret).update(payloadStr).digest('hex');
  if (signature !== expectedSignature) return false;
  try {
    const payload = JSON.parse(base64urlDecode(payloadStr));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

function blockRemoteIfNotAllowed(req, res, next) {
  if (!config.adminAllowRemote && !isDevRequest(req)) {
    return next(new ApiError(403, 'Admin panelga internetdan kirish o\'chirilgan (ADMIN_ALLOW_REMOTE=false)'));
  }
  next();
}

function adminLoginHandler(req, res, next) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return next(new ApiError(429, 'Juda ko\'p noto\'g\'ri urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.'));
  }
  if (isWeakPassword(config.adminPassword)) {
    console.error('[admin] ADMIN_PASSWORD juda zaif yoki .env da o\'rnatilmagan — kirish rad etildi');
    return next(new ApiError(500, 'Server tomonda admin parol sozlanmagan yoki juda zaif. .env faylida ADMIN_PASSWORD ni kuchli qiymatga o\'rnating.'));
  }

  const { password } = req.body || {};
  const success = typeof password === 'string' && password === config.adminPassword;
  recordAttempt(ip, success);

  if (!success) {
    return next(new ApiError(401, 'Parol xato'));
  }

  const token = issueAdminToken();
  res.json({ success: true, data: { token } });
}

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !verifyAdminToken(token)) {
    return next(new ApiError(401, 'Admin sessiyasi yaroqsiz. Qayta kiring.'));
  }
  next();
}

module.exports = {
  telegramAuth,
  verifyTelegramInitData,
  isDevRequest,
  adminLoginHandler,
  adminAuth,
  blockRemoteIfNotAllowed,
  isWeakPassword,
};
