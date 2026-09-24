const { ApiError } = require('../utils/http.util');

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err instanceof ApiError ? err.status : err.status || 500;
  if (status >= 500) {
    console.error('[xato]', err);
  }
  const message = status < 500 || err.expose
    ? err.message
    : 'Serverda kutilmagan xatolik yuz berdi. Birozdan keyin qayta urinib ko\'ring.';
  res.status(status).json({ success: false, message });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, message: 'So\'rov manzili topilmadi' });
}

module.exports = { errorMiddleware, notFoundMiddleware };
