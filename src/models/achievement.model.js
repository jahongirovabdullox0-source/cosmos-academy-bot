const { prisma } = require('../database/connection');
const cache = require('../services/cache.service');

const CACHE_PREFIX = 'achievements:';
const ACTIVE_KEY = `${CACHE_PREFIX}active`;

async function listActive() {
  const cached = cache.get(ACTIVE_KEY);
  if (cached) return cached;
  const items = await prisma.achievement.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  cache.set(ACTIVE_KEY, items, 5 * 60_000);
  return items;
}

async function listAll() {
  return prisma.achievement.findMany({ orderBy: { order: 'asc' } });
}

async function findById(id) {
  return prisma.achievement.findUnique({ where: { id: Number(id) } });
}

async function create(data) {
  const result = await prisma.achievement.create({ data });
  cache.clear(CACHE_PREFIX);
  return result;
}

async function update(id, data) {
  const result = await prisma.achievement.update({ where: { id: Number(id) }, data });
  cache.clear(CACHE_PREFIX);
  return result;
}

async function remove(id) {
  const result = await prisma.achievement.delete({ where: { id: Number(id) } });
  cache.clear(CACHE_PREFIX);
  return result;
}

module.exports = { listActive, listAll, findById, create, update, remove };
