const userModel = require('../models/user.model');
const courseModel = require('../models/course.model');
const achievementModel = require('../models/achievement.model');
const centerInfoModel = require('../models/centerInfo.model');
const registrationModel = require('../models/registration.model');
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

const listRegistrations = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20, search = '', status = '', courseId = '' } = req.query;
  const result = await registrationModel.list({
    page: Number(page),
    pageSize: Number(pageSize),
    search,
    status,
    courseId,
  });
  res.json({ success: true, data: serializeDecimals(result) });
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

const exportRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationModel.listAllForExport();
  const buffer = await exportService.buildRegistrationsWorkbook(registrations);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="arizalar.xlsx"');
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

const REQUIRED_COURSE_FIELDS = ['code', 'titleUz', 'titleEn', 'titleRu', 'descriptionUz', 'descriptionEn', 'descriptionRu', 'price'];

function validateCoursePayload(body) {
  for (const field of REQUIRED_COURSE_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new ApiError(400, `"${field}" maydoni to'ldirilishi shart`);
    }
  }
  if (Number.isNaN(Number(body.price)) || Number(body.price) < 0) {
    throw new ApiError(400, "Narx noto'g'ri");
  }
}

const createCourse = asyncHandler(async (req, res) => {
  validateCoursePayload(req.body || {});
  const { code, order, icon, titleUz, titleEn, titleRu, descriptionUz, descriptionEn, descriptionRu, price, duration, isActive } = req.body;
  const course = await courseModel.create({
    code,
    order: Number(order) || 0,
    icon: icon || '📘',
    titleUz,
    titleEn,
    titleRu,
    descriptionUz,
    descriptionEn,
    descriptionRu,
    price: Number(price),
    duration: duration || null,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
  res.json({ success: true, data: serializeDecimals(course) });
});

const updateCourse = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data = {};
  const allowedFields = ['code', 'order', 'icon', 'titleUz', 'titleEn', 'titleRu', 'descriptionUz', 'descriptionEn', 'descriptionRu', 'duration', 'isActive'];
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.price !== undefined) {
    if (Number.isNaN(Number(body.price)) || Number(body.price) < 0) throw new ApiError(400, "Narx noto'g'ri");
    data.price = Number(body.price);
  }
  if (data.order !== undefined) data.order = Number(data.order);
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

const REQUIRED_ACHIEVEMENT_FIELDS = ['titleUz', 'titleEn', 'titleRu'];

const createAchievement = asyncHandler(async (req, res) => {
  const body = req.body || {};
  for (const field of REQUIRED_ACHIEVEMENT_FIELDS) {
    if (!body[field]) throw new ApiError(400, `"${field}" maydoni to'ldirilishi shart`);
  }
  const achievement = await achievementModel.create({
    order: Number(body.order) || 0,
    value: body.value || null,
    titleUz: body.titleUz,
    titleEn: body.titleEn,
    titleRu: body.titleRu,
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
  const data = {};
  const allowedFields = ['order', 'value', 'titleUz', 'titleEn', 'titleRu', 'descriptionUz', 'descriptionEn', 'descriptionRu', 'imageUrl', 'isActive'];
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.order !== undefined) data.order = Number(data.order);
  if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);

  const achievement = await achievementModel.update(req.params.id, data);
  res.json({ success: true, data: serializeDecimals(achievement) });
});

const deleteAchievement = asyncHandler(async (req, res) => {
  await achievementModel.remove(req.params.id);
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
    'workHours', 'logoUrl',
  ];
  const data = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.phones !== undefined && !Array.isArray(data.phones)) {
    data.phones = String(data.phones).split(',').map((p) => p.trim()).filter(Boolean);
  }
  if (data.latitude !== undefined) data.latitude = data.latitude === null ? null : Number(data.latitude);
  if (data.longitude !== undefined) data.longitude = data.longitude === null ? null : Number(data.longitude);

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
