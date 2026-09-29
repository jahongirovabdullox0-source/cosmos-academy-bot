const userModel = require('../../models/user.model');
const courseModel = require('../../models/course.model');
const registrationModel = require('../../models/registration.model');
const flowState = require('../registrationState');
const { t, normalizeLang, localizedField, localizedPlain } = require('../../services/i18n.service');
const { formatMoney, escapeHtml, cleanName, isValidFullName, normalizePhone } = require('../../utils/format.util');
const {
  mainReplyKeyboard,
  courseChoiceKeyboard,
  registerCourseKeyboard,
  nameStepKeyboard,
  phoneStepKeyboard,
} = require('../keyboards');

const MOCK_CODE = 'MOCK_IELTS';

async function getLang(ctx) {
  return normalizeLang(await userModel.getLanguage(ctx.from.id));
}

function telegramFullName(from) {
  return cleanName(`${from.first_name || ''} ${from.last_name || ''}`);
}

async function answerCallback(ctx) {
  if (ctx.callbackQuery) await ctx.answerCbQuery().catch(() => {});
}

async function registerStartHandler(ctx) {
  await answerCallback(ctx);
  const [lang, courses] = await Promise.all([getLang(ctx), courseModel.listActive()]);
  const studyCourses = courses.filter((c) => c.code !== MOCK_CODE);
  if (studyCourses.length === 0) {
    await ctx.reply(t(lang, 'courses.empty'));
    return;
  }
  flowState.set(ctx.from.id, { step: 'course' });
  await ctx.reply(t(lang, 'flow.chooseCourse'), { parse_mode: 'HTML', ...courseChoiceKeyboard(studyCourses, lang) });
}

async function mockIeltsHandler(ctx) {
  await answerCallback(ctx);
  const [lang, courses] = await Promise.all([getLang(ctx), courseModel.listActive()]);
  const mock = courses.find((c) => c.code === MOCK_CODE);
  if (!mock) {
    await ctx.reply(t(lang, 'mock.unavailable'));
    return;
  }
  const text = t(lang, 'mock.info', {
    schedule: escapeHtml(localizedPlain(mock, 'duration', lang)),
    price: formatMoney(mock.price),
    description: escapeHtml(localizedField(mock, 'description', lang)),
  });
  await ctx.reply(text, { parse_mode: 'HTML', ...registerCourseKeyboard(lang, mock.id) });
}

async function courseSelectedHandler(ctx) {
  await answerCallback(ctx);
  const courseId = Number(ctx.match[1]);
  const [lang, course] = await Promise.all([getLang(ctx), courseModel.findById(courseId)]);
  if (!course || !course.isActive) {
    await ctx.reply(t(lang, 'flow.courseUnavailable'));
    return;
  }
  // Tugmani qayta bosib ikki marta ariza berilmasligi uchun tanlov tugmalarini olib tashlaymiz.
  await ctx.editMessageReplyMarkup(undefined).catch(() => {});

  flowState.set(ctx.from.id, { step: 'name', courseId: course.id });
  const suggestion = telegramFullName(ctx.from);
  await ctx.reply(t(lang, 'flow.askName', { course: escapeHtml(localizedField(course, 'title', lang)) }), {
    parse_mode: 'HTML',
    ...nameStepKeyboard(lang, isValidFullName(suggestion) ? suggestion : null),
  });
}

async function cancelHandler(ctx) {
  await answerCallback(ctx);
  flowState.clear(ctx.from.id);
  const lang = await getLang(ctx);
  if (ctx.callbackQuery) await ctx.editMessageReplyMarkup(undefined).catch(() => {});
  await ctx.reply(t(lang, 'flow.cancelled'), mainReplyKeyboard(lang));
}

async function completeRegistration(ctx, lang, state, phone) {
  flowState.clear(ctx.from.id);
  const [course, { user }] = await Promise.all([
    courseModel.findById(state.courseId),
    userModel.findOrCreateFromTelegram(ctx.from),
  ]);
  if (!course || !course.isActive) {
    await ctx.reply(t(lang, 'flow.courseUnavailable'), mainReplyKeyboard(lang));
    return;
  }
  if (user.isBlocked) {
    await ctx.reply(t(lang, 'flow.blocked'), mainReplyKeyboard(lang));
    return;
  }
  await Promise.all([
    registrationModel.create({ userId: user.id, courseId: course.id, fullName: state.fullName, phone }),
    userModel.setPhone(user.telegramId, phone),
  ]);
  const text = t(lang, 'registration.confirmed', {
    course: escapeHtml(localizedField(course, 'title', lang)),
    name: escapeHtml(state.fullName),
    phone: escapeHtml(phone),
  });
  await ctx.reply(text, { parse_mode: 'HTML', ...mainReplyKeyboard(lang) });
}

// Faol ro'yxatdan o'tish jarayoni bo'lsa matnni ism/telefon sifatida qabul qiladi, aks holda keyingi handlerga o'tadi.
async function flowTextHandler(ctx, next) {
  const state = flowState.get(ctx.from.id);
  if (!state) return next();

  const lang = await getLang(ctx);
  const text = ctx.message.text;

  if (state.step === 'course') {
    await ctx.reply(t(lang, 'flow.pickFromButtons'));
    return undefined;
  }

  if (state.step === 'name') {
    const name = cleanName(text);
    if (!isValidFullName(name)) {
      await ctx.reply(t(lang, 'flow.invalidName'), { parse_mode: 'HTML' });
      return undefined;
    }
    flowState.set(ctx.from.id, { ...state, step: 'phone', fullName: name });
    await ctx.reply(t(lang, 'flow.askPhone'), { parse_mode: 'HTML', ...phoneStepKeyboard(lang) });
    return undefined;
  }

  if (state.step === 'phone') {
    const phone = normalizePhone(text);
    if (!phone) {
      await ctx.reply(t(lang, 'flow.invalidPhone'), { parse_mode: 'HTML' });
      return undefined;
    }
    await completeRegistration(ctx, lang, state, phone);
    return undefined;
  }

  return next();
}

async function contactHandler(ctx) {
  const state = flowState.get(ctx.from.id);
  const lang = await getLang(ctx);
  if (!state || state.step !== 'phone') {
    await ctx.reply(t(lang, 'fallback.text'), mainReplyKeyboard(lang));
    return;
  }
  const phone = normalizePhone(ctx.message.contact.phone_number);
  if (!phone) {
    await ctx.reply(t(lang, 'flow.invalidPhone'), { parse_mode: 'HTML' });
    return;
  }
  await completeRegistration(ctx, lang, state, phone);
}

module.exports = {
  registerStartHandler,
  mockIeltsHandler,
  courseSelectedHandler,
  cancelHandler,
  flowTextHandler,
  contactHandler,
};
