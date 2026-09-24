const userModel = require('../../models/user.model');
const courseModel = require('../../models/course.model');
const achievementModel = require('../../models/achievement.model');
const centerInfoModel = require('../../models/centerInfo.model');
const { t, normalizeLang } = require('../../services/i18n.service');
const { formatMoney } = require('../../utils/format.util');
const { openAppInlineKeyboard } = require('../keyboards');

async function getUserLang(ctx) {
  const user = await userModel.findByTelegramId(ctx.from.id);
  return user ? normalizeLang(user.language) : 'uz';
}

function localizedField(entity, lang, field) {
  const key = `${field}${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
  return entity[key];
}

async function coursesHandler(ctx) {
  const lang = await getUserLang(ctx);
  const courses = await courseModel.listActive();
  if (courses.length === 0) {
    await ctx.reply(t(lang, 'courses.empty'));
    return;
  }
  let text = t(lang, 'courses.header');
  for (const course of courses) {
    const duration = course.duration ? t(lang, 'courses.durationSuffix', { duration: course.duration }) : '';
    text += t(lang, 'courses.line', {
      icon: course.icon,
      title: localizedField(course, lang, 'title'),
      description: localizedField(course, lang, 'description'),
      price: formatMoney(course.price),
      duration,
    });
  }
  text += t(lang, 'courses.footer');
  await ctx.reply(text, { parse_mode: 'HTML', ...openAppInlineKeyboard(lang, '#/courses') });
}

async function resultsHandler(ctx) {
  const lang = await getUserLang(ctx);
  const achievements = await achievementModel.listActive();
  if (achievements.length === 0) {
    await ctx.reply(t(lang, 'results.empty'));
    return;
  }
  let text = t(lang, 'results.header');
  for (const item of achievements) {
    text += t(lang, 'results.line', { value: item.value || '', title: localizedField(item, lang, 'title') });
  }
  text += t(lang, 'results.footer');
  await ctx.reply(text, { parse_mode: 'HTML', ...openAppInlineKeyboard(lang, '#/results') });
}

async function contactHandler(ctx) {
  const lang = await getUserLang(ctx);
  const info = await centerInfoModel.get();
  if (!info) {
    await ctx.reply(t(lang, 'contact.header'), { parse_mode: 'HTML' });
    return;
  }

  let text = t(lang, 'contact.header');
  if (info.phones && info.phones.length) text += t(lang, 'contact.phones', { phones: info.phones.join(', ') });
  const address = localizedField(info, lang, 'address');
  if (address) text += t(lang, 'contact.address', { address });
  if (info.workHours) text += t(lang, 'contact.hours', { hours: info.workHours });
  if (info.instagram) text += t(lang, 'contact.instagram', { link: info.instagram });
  if (info.telegram) text += t(lang, 'contact.telegram', { link: info.telegram });
  text += t(lang, 'contact.footer');

  await ctx.reply(text, { parse_mode: 'HTML', ...openAppInlineKeyboard(lang, '#/contact') });

  if (info.latitude && info.longitude) {
    await ctx.replyWithLocation(info.latitude, info.longitude);
  }
}

async function openAppHandler(ctx) {
  const lang = await getUserLang(ctx);
  await ctx.reply(t(lang, 'menu.openApp'), openAppInlineKeyboard(lang));
}

module.exports = { coursesHandler, resultsHandler, contactHandler, openAppHandler, getUserLang, localizedField };
