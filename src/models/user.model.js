const { prisma } = require('../database/connection');
const { startOfTodayUtc } = require('../utils/date.util');

async function findOrCreateFromTelegram(tgUser) {
  const telegramId = String(tgUser.id);
  const data = {
    firstName: tgUser.first_name || null,
    lastName: tgUser.last_name || null,
    username: tgUser.username || null,
  };
  const existing = await prisma.user.findUnique({ where: { telegramId } });
  if (existing) {
    const changed = existing.firstName !== data.firstName || existing.lastName !== data.lastName || existing.username !== data.username;
    const user = changed ? await prisma.user.update({ where: { telegramId }, data }) : existing;
    return { user, isNew: false };
  }
  const user = await prisma.user.create({ data: { telegramId, ...data } });
  return { user, isNew: true };
}

async function findByTelegramId(telegramId) {
  return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
}

async function setLanguage(telegramId, language) {
  return prisma.user.update({ where: { telegramId: String(telegramId) }, data: { language } });
}

async function setPhone(telegramId, phone) {
  return prisma.user.update({ where: { telegramId: String(telegramId) }, data: { phone } });
}

async function list({ page = 1, pageSize = 20, search = '' } = {}) {
  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { telegramId: { contains: search } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

async function setBlocked(id, isBlocked) {
  return prisma.user.update({ where: { id: Number(id) }, data: { isBlocked } });
}

async function listActiveTelegramIds() {
  const users = await prisma.user.findMany({ where: { isBlocked: false }, select: { telegramId: true } });
  return users.map((u) => u.telegramId);
}

async function countAll() {
  return prisma.user.count();
}

async function countToday() {
  return prisma.user.count({ where: { createdAt: { gte: startOfTodayUtc() } } });
}

module.exports = {
  findOrCreateFromTelegram,
  findByTelegramId,
  setLanguage,
  setPhone,
  list,
  setBlocked,
  listActiveTelegramIds,
  countAll,
  countToday,
};
