// Bot orqali ro'yxatdan o'tish bosqichlari (kurs -> ism -> telefon).
// Render'da bitta server ishlagani uchun xotirada saqlash yetarli; qayta ishga tushsa
// foydalanuvchi shunchaki boshidan boshlaydi.
const TTL_MS = 30 * 60_000;
const states = new Map();

function get(userId) {
  const key = String(userId);
  const entry = states.get(key);
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > TTL_MS) {
    states.delete(key);
    return null;
  }
  return entry;
}

function set(userId, data) {
  states.set(String(userId), { ...data, updatedAt: Date.now() });
}

function clear(userId) {
  states.delete(String(userId));
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of states) {
    if (now - entry.updatedAt > TTL_MS) states.delete(key);
  }
}, 10 * 60_000).unref();

module.exports = { get, set, clear };
