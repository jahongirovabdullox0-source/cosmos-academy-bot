const userModel = require('../../models/user.model');
const courseModel = require('../../models/course.model');
const achievementModel = require('../../models/achievement.model');
const centerInfoModel = require('../../models/centerInfo.model');
const imageModel = require('../../models/image.model');
const { t, normalizeLang, localizedField, localizedPlain } = require('../../services/i18n.service');
const { formatMoney, escapeHtml } = require('../../utils/format.util');
const { openAppInlineKeyboard, coursesListKeyboard } = require('../keyboards');

async function getUserLang(ctx) {
  return normalizeLang(await userModel.getLanguage(ctx.from.id));
}

async function coursesHandler(ctx) {
  const [lang, courses] = await Promise.all([getUserLang(ctx), courseModel.listActive()]);
  if (courses.length === 0) {
    await ctx.reply(t(lang, 'courses.empty'));
    return;
  }
  let text = t(lang, 'courses.header');
  for (const course of courses) {
    const duration = localizedPlain(course, 'duration', lang);
    text += t(lang, 'courses.line', {
      icon: course.icon,
      title: escapeHtml(localizedField(course, 'title', lang)),
      price: formatMoney(course.price),
      duration: duration ? t(lang, 'courses.durationSuffix', { duration: escapeHtml(duration) }) : '',
    });
  }
  text += t(lang, 'courses.footer');
  await ctx.reply(text, { parse_mode: 'HTML', ...coursesListKeyboard(lang) });
}

// Telegram'ga bir marta yuklangan rasmni qayta yuklamaslik uchun file_id'ni eslab qolamiz.
const telegramFileIds = new Map();

async function photoSource(imageUrl) {
  if (telegramFileIds.has(imageUrl)) return telegramFileIds.get(imageUrl);
  const imageId = imageModel.extractId(imageUrl);
  if (!imageId) return imageUrl;
  const image = await imageModel.getById(imageId);
  return image ? { source: image.data } : null;
}

async function sendCertificates(ctx, lang, items) {
  const media = [];
  const urls = [];
  for (const item of items) {
    const source = await photoSource(item.imageUrl);
    if (!source) continue;
    const caption = [item.value, localizedField(item, 'title', lang)].filter(Boolean).join(' — ');
    media.push({ type: 'photo', media: source, caption: caption.slice(0, 1000) });
    urls.push(item.imageUrl);
  }
  if (media.length === 0) return;
  media[0].caption = `${t(lang, 'results.certificatesTitle')}\n\n${media[0].caption}`.slice(0, 1000);

  const remember = (message, index) => {
    const sizes = message && message.photo;
    if (sizes && sizes.length) telegramFileIds.set(urls[index], sizes[sizes.length - 1].file_id);
  };

  // sendMediaGroup kamida 2 ta rasm talab qiladi.
  if (media.length === 1) {
    const message = await ctx.replyWithPhoto(media[0].media, { caption: media[0].caption });
    remember(message, 0);
    return;
  }
  const messages = await ctx.replyWithMediaGroup(media);
  messages.forEach(remember);
}

async function resultsHandler(ctx) {
  const [lang, achievements] = await Promise.all([getUserLang(ctx), achievementModel.listActive()]);
  const stats = achievements.filter((a) => !a.imageUrl);
  const certificates = achievements.filter((a) => a.imageUrl);
  if (stats.length === 0 && certificates.length === 0) {
    await ctx.reply(t(lang, 'results.empty'));
    return;
  }
  if (stats.length > 0) {
    let text = t(lang, 'results.header');
    for (const item of stats) {
      text += t(lang, 'results.line', {
        value: escapeHtml(item.value || ''),
        title: escapeHtml(localizedField(item, 'title', lang)),
      });
    }
    text += t(lang, 'results.footer');
    await ctx.reply(text, { parse_mode: 'HTML', ...openAppInlineKeyboard(lang, '#/results') });
  }
  if (certificates.length > 0) {
    try {
      await sendCertificates(ctx, lang, certificates.slice(0, 10));
    } catch (err) {
      console.error('[bot] Sertifikatlarni yuborishda xatolik:', err.message);
    }
  }
}

async function contactHandler(ctx) {
  const [lang, info] = await Promise.all([getUserLang(ctx), centerInfoModel.get()]);
  if (!info) {
    await ctx.reply(t(lang, 'contact.header'), { parse_mode: 'HTML' });
    return;
  }

  let text = t(lang, 'contact.header');
  if (info.phones && info.phones.length) {
    text += t(lang, 'contact.phones', { phones: escapeHtml(info.phones.join(', ')) });
  }
  const address = localizedField(info, 'address', lang);
  if (address) text += t(lang, 'contact.address', { address: escapeHtml(address) });
  const hours = localizedPlain(info, 'workHours', lang);
  if (hours) text += t(lang, 'contact.hours', { hours: escapeHtml(hours) });
  if (info.instagram) text += t(lang, 'contact.instagram', { link: escapeHtml(info.instagram) });
  if (info.telegram) text += t(lang, 'contact.telegram', { link: escapeHtml(info.telegram) });
  text += t(lang, 'contact.footer');

  await ctx.reply(text, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...openAppInlineKeyboard(lang, '#/contact'),
  });

  if (info.latitude && info.longitude) {
    await ctx.replyWithLocation(info.latitude, info.longitude);
  }
}

async function openAppHandler(ctx) {
  const lang = await getUserLang(ctx);
  await ctx.reply(t(lang, 'menu.openAppHint'), openAppInlineKeyboard(lang));
}

module.exports = { coursesHandler, resultsHandler, contactHandler, openAppHandler, getUserLang };
