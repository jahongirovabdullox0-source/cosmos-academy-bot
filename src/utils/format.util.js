function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function formatMoney(value) {
  const num = typeof value === 'number' ? value : toNumber(value);
  if (num === null || Number.isNaN(num)) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function serializeDecimals(input) {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map(serializeDecimals);
  if (input instanceof Date) return input.toISOString();
  if (typeof input === 'object') {
    if (typeof input.toNumber === 'function') return input.toNumber();
    const out = {};
    for (const key of Object.keys(input)) {
      out[key] = serializeDecimals(input[key]);
    }
    return out;
  }
  return input;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cleanName(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim();
}

// Ism va familiya: kamida 2 ta so'z, faqat harflar va apostrof/tire (O'g'il, G'ulom kabi).
function isValidFullName(raw) {
  const name = cleanName(raw);
  if (name.length < 5 || name.length > 80) return false;
  if (!/^[\p{L}\s'ʻʼ‘’`.-]+$/u.test(name)) return false;
  const words = name.split(' ').filter((w) => w.replace(/[^\p{L}]/gu, '').length >= 2);
  return words.length >= 2;
}

// "90 123 45 67", "+998 90 123-45-67", "998901234567" -> "+998901234567"
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

module.exports = {
  toNumber,
  formatMoney,
  serializeDecimals,
  escapeHtml,
  cleanName,
  isValidFullName,
  normalizePhone,
};
