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

module.exports = { toNumber, formatMoney, serializeDecimals, escapeHtml };
