const ExcelJS = require('exceljs');
const { formatDateTime } = require('../utils/date.util');
const { toNumber } = require('../utils/format.util');

const STATUS_LABELS = {
  NEW: 'Yangi',
  CONTACTED: "Bog'lanildi",
  CONFIRMED: 'Tasdiqlandi',
  CANCELLED: 'Bekor qilindi',
};

async function buildRegistrationsWorkbook(registrations) {
  const workbook = new ExcelJS.Workbook();
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet('Arizalar');
  sheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Ism familiya', key: 'fullName', width: 28 },
    { header: 'Telefon', key: 'phone', width: 18 },
    { header: 'Kurs', key: 'course', width: 26 },
    { header: 'Narxi (so\'m)', key: 'price', width: 16 },
    { header: 'Holati', key: 'status', width: 16 },
    { header: 'Izoh', key: 'note', width: 30 },
    { header: 'Telegram username', key: 'username', width: 20 },
    { header: 'Sana', key: 'createdAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };

  registrations.forEach((reg, idx) => {
    sheet.addRow({
      index: idx + 1,
      fullName: reg.fullName,
      phone: reg.phone,
      course: reg.course ? reg.course.titleUz : '—',
      price: reg.course ? toNumber(reg.course.price) : 0,
      status: STATUS_LABELS[reg.status] || reg.status,
      note: reg.note || '',
      username: reg.user && reg.user.username ? `@${reg.user.username}` : '',
      createdAt: formatDateTime(reg.createdAt),
    });
  });

  sheet.getColumn('price').numFmt = '#,##0';

  return workbook.xlsx.writeBuffer();
}

module.exports = { buildRegistrationsWorkbook };
