const { prisma } = require('../database/connection');
const {
  daysAgoUtc,
  startOfTodayUtc,
  tashkentDateString,
  shiftDateString,
  tashkentDayRange,
} = require('../utils/date.util');

function buildWhere({ search = '', status = '', courseId = '', date = '' } = {}) {
  const conditions = [];
  if (search) {
    const or = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
    // Telefonlar "+998901234567" ko'rinishida saqlanadi — "90 123 45" kabi qidiruv ham topsin.
    const digits = search.replace(/\D/g, '');
    if (digits.length >= 3) or.push({ phone: { contains: digits } });
    conditions.push({ OR: or });
  }
  if (status) conditions.push({ status });
  if (courseId) conditions.push({ courseId: Number(courseId) });
  if (date) {
    const { start, end } = tashkentDayRange(date);
    conditions.push({ createdAt: { gte: start, lt: end } });
  }
  return { AND: conditions };
}

async function create({ userId, courseId, fullName, phone }) {
  return prisma.registration.create({
    data: { userId, courseId, fullName, phone },
    include: { course: true, user: true },
  });
}

async function listForUser(userId) {
  return prisma.registration.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { course: true },
  });
}

async function list({ page = 1, pageSize = 20, ...filters } = {}) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { course: true, user: true },
    }),
    prisma.registration.count({ where }),
  ]);
  return { items, total };
}

async function listAllForExport(filters = {}) {
  return prisma.registration.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: 'desc' },
    include: { course: true, user: true },
  });
}

// Bugun va kecha nechta ariza tushgani (kurs/holat filtrlari hisobga olinadi).
async function dayCounts({ status = '', courseId = '' } = {}) {
  const today = tashkentDateString();
  const yesterday = shiftDateString(today, -1);
  const [todayCount, yesterdayCount] = await Promise.all([
    prisma.registration.count({ where: buildWhere({ status, courseId, date: today }) }),
    prisma.registration.count({ where: buildWhere({ status, courseId, date: yesterday }) }),
  ]);
  return {
    today: { date: today, count: todayCount },
    yesterday: { date: yesterday, count: yesterdayCount },
  };
}

async function findById(id) {
  return prisma.registration.findUnique({ where: { id: Number(id) }, include: { course: true, user: true } });
}

async function updateStatus(id, status, note) {
  const data = { status };
  if (note !== undefined) data.note = note;
  return prisma.registration.update({ where: { id: Number(id) }, data, include: { course: true, user: true } });
}

async function remove(id) {
  return prisma.registration.delete({ where: { id: Number(id) } });
}

async function countAll() {
  return prisma.registration.count();
}

async function countToday() {
  return prisma.registration.count({ where: { createdAt: { gte: startOfTodayUtc() } } });
}

async function countByStatus() {
  const rows = await prisma.registration.groupBy({ by: ['status'], _count: { _all: true } });
  return rows.reduce((acc, row) => ({ ...acc, [row.status]: row._count._all }), {});
}

async function countByCourse() {
  const rows = await prisma.registration.groupBy({ by: ['courseId'], _count: { _all: true } });
  const courses = await prisma.course.findMany({ where: { id: { in: rows.map((r) => r.courseId) } } });
  return rows.map((row) => ({
    courseId: row.courseId,
    count: row._count._all,
    course: courses.find((c) => c.id === row.courseId) || null,
  }));
}

async function dailyCountsLast7Days() {
  const since = daysAgoUtc(6);
  const rows = await prisma.registration.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const buckets = {};
  for (let i = 0; i < 7; i++) {
    const d = daysAgoUtc(6 - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (buckets[key] !== undefined) buckets[key] += 1;
  }
  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}

module.exports = {
  create,
  listForUser,
  list,
  listAllForExport,
  dayCounts,
  findById,
  updateStatus,
  remove,
  countAll,
  countToday,
  countByStatus,
  countByCourse,
  dailyCountsLast7Days,
};
