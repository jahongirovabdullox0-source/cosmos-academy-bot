const { ApiError } = require('../utils/http.util');

// body-parser xatolari inglizcha keladi — foydalanuvchiga o'zbekcha ko'rsatamiz.
const BODY_PARSER_MESSAGES = {
  'entity.too.large': 'Fayl yoki ma\'lumot hajmi juda katta (rasm uchun maksimal 8 MB).',
  'entity.parse.failed': 'So\'rov ma\'lumotlari noto\'g\'ri formatda.',
};

// Prisma xato kodlari: P2002 — takrorlanmas qiymat band, P2025 — yozuv topilmadi.
const PRISMA_ERRORS = {
  P2002: [409, 'Bu qiymat allaqachon mavjud (masalan, shu kod bilan kurs bor).'],
  P2025: [404, "Yozuv topilmadi — sahifani yangilab, qayta urinib ko'ring."],
};

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (PRISMA_ERRORS[err.code]) {
    const [prismaStatus, prismaMessage] = PRISMA_ERRORS[err.code];
    res.status(prismaStatus).json({ success: false, message: prismaMessage });
    return;
  }
  const status = err instanceof ApiError ? err.status : err.status || 500;
  if (status >= 500) {
    console.error('[xato]', err);
  }
  let message;
  if (BODY_PARSER_MESSAGES[err.type]) {
    message = BODY_PARSER_MESSAGES[err.type];
  } else if (status < 500 || err.expose) {
    message = err.message;
  } else {
    message = 'Serverda kutilmagan xatolik yuz berdi. Birozdan keyin qayta urinib ko\'ring.';
  }
  res.status(status).json({ success: false, message });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, message: 'So\'rov manzili topilmadi' });
}

module.exports = { errorMiddleware, notFoundMiddleware };
