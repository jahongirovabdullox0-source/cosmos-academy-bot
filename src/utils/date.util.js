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

module.exports = { TZ, formatDateTime, formatDate, startOfTodayUtc, daysAgoUtc };
