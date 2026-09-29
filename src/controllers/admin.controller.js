const userModel = require('../models/user.model');
const courseModel = require('../models/course.model');
const achievementModel = require('../models/achievement.model');
const centerInfoModel = require('../models/centerInfo.model');
const registrationModel = require('../models/registration.model');
const imageModel = require('../models/image.model');
const statsService = require('../services/stats.service');
const exportService = require('../services/export.service');
const broadcastService = require('../services/broadcast.service');
const { bot } = require('../core/bot');
const { asyncHandler, ApiError } = require('../utils/http.util');
const { serializeDecimals } = require('../utils/format.util');

// ---------------- Dashboard ----------------

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getDashboardStats();
  res.json({ success: true, data: serializeDecimals(stats) });
});

// ---------------- Registrations ----------------

const REGISTRATION_STATUSES = ['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED'];

function parseRegistrationFilters(query) {
  const { search = '', status = '', courseId = '', date = '' } = query;
  if (status && !REGISTRATION_STATUSES.includes(status)) throw new ApiError(400, "Holat noto'g'ri");
  if (courseId && !/^\d+$/.test(courseId)) throw new ApiError(400, "Kurs noto'g'ri");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, "Sana noto'g'ri (YYYY-MM-DD)");
  return { search: String(search).trim(), status, courseId, date };
}

const listRegistrations = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const result = await registrationModel.list({
    page: Number(page) || 1,
    pageSize: Math.min(Number(pageSize) || 20, 100),
    ...parseRegistrationFilters(req.query),
  });
  res.json({ success: true, data: serializeDecimals(result) });
});

const registrationsSummary = asyncHandler(async (req, res) => {
  const { status, courseId } = parseRegistrationFilters(req.query);
  const counts = await registrationModel.dayCounts({ status, courseId });
  res.json({ success: true, data: counts });
});

const updateRegistration = asyncHandler(async (req, res) => {
  const { status, note } = req.body || {};
  const allowed = ['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED'];
  if (status && !allowed.includes(status)) {
    throw new ApiError(400, "Holat noto'g'ri");
  }
  const registration = await registrationModel.updateStatus(req.params.id, status, note);
  res.json({ success: true, data: serializeDecimals(registration) });
});

const deleteRegistration = asyncHandler(async (req, res) => {
  await registrationModel.remove(req.params.id);
  res.json({ success: true });
});

// Excel ekranda tanlangan filtrlar (kun, kurs, holat) bo'yicha yuklanadi.
const exportRegistrations = asyncHandler(async (req, res) => {
  const filters = parseRegistrationFilters(req.query);
  const registrations = await registrationModel.listAllForExport(filters);
  const buffer = await exportService.buildRegistrationsWorkbook(registrations);
  const filename = filters.date ? `arizalar-${filters.date}.xlsx` : 'arizalar.xlsx';
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

// ---------------- Users ----------------

const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20, search = '' } = req.query;
  const result = await userModel.list({ page: Number(page), pageSize: Number(pageSize), search });
  res.json({ success: true, data: serializeDecimals(result) });
});

const setUserBlocked = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body || {};
  const user = await userModel.setBlocked(req.params.id, Boolean(isBlocked));
  res.json({ success: true, data: serializeDecimals(user) });
});

// ---------------- Courses ----------------

const listCourses = asyncHandler(async (req, res) => {
  const courses = await courseModel.listAll();
  res.json({ success: true, data: serializeDecimals(courses) });
});

// Faqat o'zbekcha maydonlar majburiy: inglizcha/ruscha bo'sh qolsa, bot va Mini App o'zbekchasini ko'rsatadi.
const FIELD_LABELS = {
  code: 'Kod',
  titleUz: "Nomi (o'zbekcha)",
  descriptionUz: "Tavsif (o'zbekcha)",
  price: 'Narx',
};

function requireFields(body, fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      throw new ApiError(400, `"${FIELD_LABELS[field] || field}" maydoni to'ldirilishi shart`);
    }
  }
}

function parsePrice(value) {
  const price = Number(value);
  if (Number.isNaN(price) || price < 0) throw new ApiError(400, "Narx noto'g'ri");
  return price;
}

const COURSE_TEXT_FIELDS = ['titleEn', 'titleRu', 'descriptionEn', 'descriptionRu'];
const COURSE_NULLABLE_FIELDS = ['duration', 'durationEn', 'durationRu'];

const createCourse = asyncHandler(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['code', 'titleUz', 'descriptionUz', 'price']);
  const data = {
    code: String(body.code).trim().toUpperCase(),
    order: Number(body.order) || 0,
    icon: body.icon || '📘',
    titleUz: body.titleUz,
    descriptionUz: body.descriptionUz,
    price: parsePrice(body.price),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
  for (const field of COURSE_TEXT_FIELDS) data[field] = body[field] || '';
  for (const field of COURSE_NULLABLE_FIELDS) data[field] = body[field] || null;
  const course = await courseModel.create(data);
  res.json({ success: true, data: serializeDecimals(course) });
});

const updateCourse = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data = {};
  for (const field of ['order', 'icon', 'titleUz', 'descriptionUz', 'isActive']) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  for (const field of COURSE_TEXT_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] || '';
  }
  for (const field of COURSE_NULLABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] || null;
  }
  if (data.titleUz !== undefined) requireFields(data, ['titleUz']);
  if (data.descriptionUz !== undefined) requireFields(data, ['descriptionUz']);
  if (body.price !== undefined) data.price = parsePrice(body.price);
  if (data.order !== undefined) data.order = Number(data.order) || 0;
  if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

  const course = await courseModel.update(req.params.id, data);
  res.json({ success: true, data: serializeDecimals(course) });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseModel.remove(req.params.id);
  res.json({ success: true });
});

// ---------------- Achievements ----------------

const listAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementModel.listAll();
  res.json({ success: true, data: serializeDecimals(achievements) });
});

const createAchievement = asyncHandler(async (req, res) => {
  const body = req.body || {};
  requireFields(body, ['titleUz']);
  const achievement = await achievementModel.create({
    order: Number(body.order) || 0,
    value: body.value || null,
    titleUz: body.titleUz,
    titleEn: body.titleEn || '',
    titleRu: body.titleRu || '',
    descriptionUz: body.descriptionUz || null,
    descriptionEn: body.descriptionEn || null,
    descriptionRu: body.descriptionRu || null,
    imageUrl: body.imageUrl || null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  });
  res.json({ success: true, data: serializeDecimals(achievement) });
});

const updateAchievement = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const existing = await achievementModel.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Natija topilmadi');

  const data = {};
  for (const field of ['order', 'value', 'titleUz', 'isActive']) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  for (const field of ['titleEn', 'titleRu']) {
    if (body[field] !== undefined) data[field] = body[field] || '';
  }
  for (const field of ['descriptionUz', 'descriptionEn', 'descriptionRu', 'imageUrl']) {
    if (body[field] !== undefined) data[field] = body[field] || null;
  }
  if (data.titleUz !== undefined) requireFields(data, ['titleUz']);
  if (data.order !== undefined) data.order = Number(data.order) || 0;
  if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

  const achievement = await achievementModel.update(req.params.id, data);
  if (data.imageUrl !== undefined && existing.imageUrl && existing.imageUrl !== data.imageUrl) {
    await imageModel.removeByUrl(existing.imageUrl);
  }
  res.json({ success: true, data: serializeDecimals(achievement) });
});

const deleteAchievement = asyncHandler(async (req, res) => {
  const removed = await achievementModel.remove(req.params.id);
  if (removed.imageUrl) await imageModel.removeByUrl(removed.imageUrl);
  res.json({ success: true });
});

// ---------------- Center info ----------------

const getCenterInfo = asyncHandler(async (req, res) => {
  const info = await centerInfoModel.get();
  res.json({ success: true, data: serializeDecimals(info) });
});

const updateCenterInfo = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const allowedFields = [
    'nameUz', 'nameEn', 'nameRu',
    'aboutUz', 'aboutEn', 'aboutRu',
    'phones', 'addressUz', 'addressEn', 'addressRu',
    'latitude', 'longitude',
    'instagram', 'telegram', 'facebook', 'youtube',
    'workHours', 'workHoursEn', 'workHoursRu', 'logoUrl',
  ];
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.phones !== undefined && !Array.isArray(data.phones)) {
    data.phones = String(data.phones).split(',').map((p) => p.trim()).filter(Boolean);
  }
  for (const field of ['latitude', 'longitude']) {
    if (data[field] === undefined) continue;
    if (data[field] === null || data[field] === '') {
      data[field] = null;
    } else {
      data[field] = Number(String(data[field]).replace(',', '.'));
      if (Number.isNaN(data[field])) throw new ApiError(400, "Koordinata noto'g'ri (masalan: 40.6219)");
    }
  }

  const info = await centerInfoModel.update(data);
  res.json({ success: true, data: serializeDecimals(info) });
});

// ---------------- Broadcast ----------------

const sendBroadcast = asyncHandler(async (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim()) {
    throw new ApiError(400, 'Xabar matni bo\'sh bo\'lishi mumkin emas');
  }
  if (!bot) {
    throw new ApiError(503, 'Bot ishga tushirilmagan (BOT_TOKEN yo\'q)');
  }
  const result = await broadcastService.sendToAll(bot, String(text).trim());
  res.json({ success: true, data: result });
});

const getBroadcastHistory = asyncHandler(async (req, res) => {
  const items = await broadcastService.history();
  res.json({ success: true, data: serializeDecimals(items) });
});

module.exports = {
  getDashboardStats,
  listRegistrations,
  registrationsSummary,
  updateRegistration,
  deleteRegistration,
  exportRegistrations,
  listUsers,
  setUserBlocked,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getCenterInfo,
  updateCenterInfo,
  sendBroadcast,
  getBroadcastHistory,
};
