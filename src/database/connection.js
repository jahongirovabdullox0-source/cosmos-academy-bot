const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
});

async function warmupConnections(count = 5) {
  const tasks = Array.from({ length: count }, () => prisma.$queryRaw`SELECT 1`);
  try {
    await Promise.all(tasks);
    console.log(`[db] ${count} ta ulanish oldindan ochildi`);
  } catch (err) {
    console.error('[db] Ulanishlarni oldindan ochishda xatolik:', err.message);
  }
}

module.exports = { prisma, warmupConnections };
