const userModel = require('../models/user.model');
const courseModel = require('../models/course.model');
const achievementModel = require('../models/achievement.model');
const centerInfoModel = require('../models/centerInfo.model');
const registrationModel = require('../models/registration.model');
const { asyncHandler, ApiError } = require('../utils/http.util');
const { serializeDecimals, escapeHtml } = require('../utils/format.util');
const { normalizeLang, t } = require('../services/i18n.service');
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
    throw new ApiError(400, "Kurs, ism va telefon raqami kiritilishi shart");
  }
  if (String(fullName).trim().length < 2) {
    throw new ApiError(400, 'Ism juda qisqa');
  }
  const phoneDigits = String(phone).replace(/[^\d+]/g, '');
  if (phoneDigits.replace(/\D/g, '').length < 9) {
    throw new ApiError(400, "Telefon raqami noto'g'ri");
  }

  const course = await courseModel.findById(courseId);
  if (!course || !course.isActive) {
    throw new ApiError(404, 'Kurs topilmadi');
  }

  const { user } = await userModel.findOrCreateFromTelegram(req.telegramUser);
  await userModel.setPhone(user.telegramId, phoneDigits);

  const registration = await registrationModel.create({
    userId: user.id,
    courseId: course.id,
    fullName: String(fullName).trim(),
    phone: phoneDigits,
  });

  const lang = normalizeLang(user.language);
  const langCap = lang.charAt(0).toUpperCase() + lang.slice(1);
  const courseTitle = course[`title${langCap}`];

  if (bot) {
    bot.telegram
      .sendMessage(
        user.telegramId,
        t(lang, 'registration.confirmed', {
          course: escapeHtml(courseTitle),
          name: escapeHtml(registration.fullName),
          phone: escapeHtml(phoneDigits),
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
