const userModel = require('../models/user.model');
const registrationModel = require('../models/registration.model');
const { toNumber } = require('../utils/format.util');

async function getDashboardStats() {
  const [usersTotal, usersToday, registrationsTotal, registrationsToday, byStatus, byCourse, daily] = await Promise.all([
    userModel.countAll(),
    userModel.countToday(),
    registrationModel.countAll(),
    registrationModel.countToday(),
    registrationModel.countByStatus(),
    registrationModel.countByCourse(),
    registrationModel.dailyCountsLast7Days(),
  ]);

  return {
    users: { total: usersTotal, today: usersToday },
    registrations: {
      total: registrationsTotal,
      today: registrationsToday,
      byStatus: {
        NEW: byStatus.NEW || 0,
        CONTACTED: byStatus.CONTACTED || 0,
        CONFIRMED: byStatus.CONFIRMED || 0,
        CANCELLED: byStatus.CANCELLED || 0,
      },
      byCourse: byCourse.map((row) => ({
        courseId: row.courseId,
        count: row.count,
        title: row.course ? row.course.titleUz : '—',
        price: row.course ? toNumber(row.course.price) : null,
      })),
      daily,
    },
  };
}

module.exports = { getDashboardStats };
