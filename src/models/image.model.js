const { prisma } = require('../database/connection');

const MAX_MEMORY_ITEMS = 40;
const memory = new Map();
const INTERNAL_URL = /^\/api\/images\/([a-z0-9]+)$/i;

function urlFor(id) {
  return `/api/images/${id}`;
}

function extractId(url) {
  const match = INTERNAL_URL.exec(url || '');
  return match ? match[1] : null;
}

async function create({ mime, data }) {
  return prisma.image.create({
    data: { mime, size: data.length, data },
    select: { id: true, mime: true, size: true },
  });
}

async function getById(id) {
  if (memory.has(id)) {
    const value = memory.get(id);
    memory.delete(id);
    memory.set(id, value);
    return value;
  }
  const row = await prisma.image.findUnique({ where: { id } });
  if (!row) return null;
  // Prisma 6 Bytes'ni Uint8Array qaytaradi — Express va Telegraf Buffer kutadi.
  const value = { mime: row.mime, data: Buffer.from(row.data) };
  memory.set(id, value);
  if (memory.size > MAX_MEMORY_ITEMS) memory.delete(memory.keys().next().value);
  return value;
}

async function removeByUrl(url) {
  const id = extractId(url);
  if (!id) return;
  memory.delete(id);
  await prisma.image.deleteMany({ where: { id } });
}

// Admin rasm yuklab, saqlamasdan oynani yopsa rasm hech qayerga bog'lanmay qoladi.
// Bir kundan eski va hech bir natijada ishlatilmagan rasmlarni o'chiramiz (Neon bepul hajmi 0.5 GB).
async function cleanupOrphans() {
  const used = await prisma.achievement.findMany({
    where: { imageUrl: { startsWith: '/api/images/' } },
    select: { imageUrl: true },
  });
  const usedIds = used.map((a) => extractId(a.imageUrl)).filter(Boolean);
  const { count } = await prisma.image.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) }, id: { notIn: usedIds } },
  });
  if (count) console.log(`[images] ${count} ta ishlatilmagan rasm o'chirildi`);
}

module.exports = { create, getById, removeByUrl, cleanupOrphans, urlFor, extractId };
