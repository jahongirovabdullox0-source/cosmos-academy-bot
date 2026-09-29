const imageModel = require('../models/image.model');
const { asyncHandler, ApiError } = require('../utils/http.util');

// Content-Type sarlavhasiga ishonmaymiz — fayl baytlarining boshidan formatni aniqlaymiz.
function detectMime(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

const uploadImage = asyncHandler(async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    throw new ApiError(400, 'Rasm fayli topilmadi');
  }
  const mime = detectMime(req.body);
  if (!mime) {
    throw new ApiError(400, 'Faqat JPG, PNG yoki WEBP formatdagi rasm yuklash mumkin');
  }
  const image = await imageModel.create({ mime, data: req.body });
  res.json({ success: true, data: { id: image.id, url: imageModel.urlFor(image.id), size: image.size } });
});

const serveImage = asyncHandler(async (req, res) => {
  const image = await imageModel.getById(req.params.id);
  if (!image) throw new ApiError(404, 'Rasm topilmadi');
  res.set({
    'Content-Type': image.mime,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(image.data);
});

module.exports = { uploadImage, serveImage };
