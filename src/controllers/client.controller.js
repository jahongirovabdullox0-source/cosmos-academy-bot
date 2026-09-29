const userModel = require('../models/user.model');
const courseModel = require('../models/course.model');
const achievementModel = require('../models/achievement.model');
const centerInfoModel = require('../models/centerInfo.model');
const registrationModel = require('../models/registration.model');
const { asyncHandler, ApiError } = require('../utils/http.util');
const { serializeDecimals, escapeHtml, cleanName, isValidFullName, normalizePhone } = require('../utils/format.util');
const { normalizeLang, t, localizedField } = require('../services/i18n.service');
const { bot } = require('../core/bot');

const getMe = asyncHandler(async (req, res) => {
  const { user } = await userModel.findOrCreateFromTelegram(req.telegramUser);
  res.json({ success: true, data: serializeDecimals(user) });
});

const setLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body || {};
  if (!['uz', 'en', 'ru'].includes(language)) {
    throw new ApiError(400, "Til noto'g'ri");
  }
  await userModel.findOrCreateFromTelegram(req.telegramUser);
  const user = await userModel.setLanguage(req.telegramUser.id, language);
  res.json({ success: true, data: serializeDecimals(user) });
});

const getCourses = asyncHandler(async (req, res) => {
  const courses = await courseModel.listActive();
  res.json({ success: true, data: serializeDecimals(courses) });
});

const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementModel.listActive();
  res.json({ success: true, data: serializeDecimals(achievements) });
});

const getCenterInfo = asyncHandler(async (req, res) => {
  const info = await centerInfoModel.get();
  res.json({ success: true, data: serializeDecimals(info) });
});

const register = asyncHandler(async (req, res) => {
  const { courseId, fullName, phone } = req.body || {};
  if (!courseId || !fullName || !phone) {
    throw new ApiError(400, "Kurs, ism-familiya va telefon raqami kiritilishi shart");
  }
  const name = cleanName(fullName);
  if (!isValidFullName(name)) {
    throw new ApiError(400, "Ism va familiyani to'liq kiriting");
  }
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new ApiError(400, "Telefon raqami noto'g'ri");
  }

  const [course, { user }] = await Promise.all([
    courseModel.findById(courseId),
    userModel.findOrCreateFromTelegram(req.telegramUser),
  ]);
  if (!course || !course.isActive) {
    throw new ApiError(404, 'Kurs topilmadi');
  }
  if (user.isBlocked) {
    throw new ApiError(403, "Ariza qoldirish imkoniyatingiz cheklangan. Markaz bilan bog'laning.");
  }

  const [registration] = await Promise.all([
    registrationModel.create({ userId: user.id, courseId: course.id, fullName: name, phone: normalizedPhone }),
    userModel.setPhone(user.telegramId, normalizedPhone),
  ]);

  const lang = normalizeLang(user.language);
  if (bot) {
    bot.telegram
      .sendMessage(
        user.telegramId,
        t(lang, 'registration.confirmed', {
          course: escapeHtml(localizedField(course, 'title', lang)),
          name: escapeHtml(name),
          phone: escapeHtml(normalizedPhone),
        }),
        { parse_mode: 'HTML' }
      )
      .catch(() => {});
  }

  res.json({ success: true, data: serializeDecimals(registration) });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const user = await userModel.findByTelegramId(req.telegramUser.id);
  if (!user) {
    res.json({ success: true, data: [] });
    return;
  }
  const registrations = await registrationModel.listForUser(user.id);
  res.json({ success: true, data: serializeDecimals(registrations) });
});

module.exports = {
  getMe,
  setLanguage,
  getCourses,
  getAchievements,
  getCenterInfo,
  register,
  getMyRegistrations,
};
