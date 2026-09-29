const TZ = 'Asia/Tashkent';

function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('uz-UZ', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('uz-UZ', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function startOfTodayUtc() {
  const now = new Date();
  const tashkentNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  tashkentNow.setHours(0, 0, 0, 0);
  const offsetMs = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: TZ })).getTime();
  return new Date(tashkentNow.getTime() + offsetMs);
}

function daysAgoUtc(days) {
  const d = startOfTodayUtc();
  d.setDate(d.getDate() - days);
  return d;
}

// O'zbekistonda yozgi vaqt yo'q — Toshkent doim UTC+5.
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Toshkent bo'yicha bugungi sana: "2026-09-29"
function tashkentDateString(date = new Date()) {
  return new Date(date.getTime() + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

function shiftDateString(dateStr, days) {
  return new Date(Date.parse(`${dateStr}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

// "2026-09-29" -> Toshkent bo'yicha shu kunning UTC oralig'i [start, end)
function tashkentDayRange(dateStr) {
  const start = new Date(Date.parse(`${dateStr}T00:00:00Z`) - TASHKENT_OFFSET_MS);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

module.exports = {
  TZ,
  formatDateTime,
  formatDate,
  startOfTodayUtc,
  daysAgoUtc,
  tashkentDateString,
  shiftDateString,
  tashkentDayRange,
};
