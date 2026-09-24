const { prisma } = require('../database/connection');
const cache = require('../services/cache.service');
const { ApiError } = require('../utils/http.util');

const CACHE_PREFIX = 'courses:';
const ACTIVE_KEY = `${CACHE_PREFIX}active`;

async function listActive() {
  const cached = cache.get(ACTIVE_KEY);
  if (cached) return cached;
  const courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  cache.set(ACTIVE_KEY, courses, 5 * 60_000);
  return courses;
}

async function listAll() {
  return prisma.course.findMany({ orderBy: { order: 'asc' } });
}

async function findById(id) {
  return prisma.course.findUnique({ where: { id: Number(id) } });
}

async function create(data) {
  const result = await prisma.course.create({ data });
  cache.clear(CACHE_PREFIX);
  return result;
}

async function update(id, data) {
  const result = await prisma.course.update({ where: { id: Number(id) }, data });
  cache.clear(CACHE_PREFIX);
  return result;
}

async function reorder(id, order) {
  const result = await prisma.course.update({ where: { id: Number(id) }, data: { order } });
  cache.clear(CACHE_PREFIX);
  return result;
}

async function remove(id) {
  const registrationsCount = await prisma.registration.count({ where: { courseId: Number(id) } });
  if (registrationsCount > 0) {
    throw new ApiError(409, 'Bu kursga arizalar mavjud, shuning uchun butunlay o\'chirib bo\'lmaydi. Uni "faolsiz" holatga o\'tkazing.');
  }
  const result = await prisma.course.delete({ where: { id: Number(id) } });
  cache.clear(CACHE_PREFIX);
  return result;
}

module.exports = { listActive, listAll, findById, create, update, reorder, remove };
