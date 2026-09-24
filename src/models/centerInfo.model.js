const { prisma } = require('../database/connection');
const cache = require('../services/cache.service');

const CACHE_KEY = 'centerInfo';

async function get() {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;
  const info = await prisma.centerInfo.findUnique({ where: { id: 1 } });
  if (info) cache.set(CACHE_KEY, info, 10 * 60_000);
  return info;
}

async function update(data) {
  const result = await prisma.centerInfo.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  cache.clear(CACHE_KEY);
  return result;
}

module.exports = { get, update };
