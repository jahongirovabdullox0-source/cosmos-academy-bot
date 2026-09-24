const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const courses = [
  {
    code: 'A1',
    order: 1,
    icon: '🌱',
    titleUz: 'A1 — Boshlang\'ich daraja',
    titleEn: 'A1 — Beginner level',
    titleRu: 'A1 — Начальный уровень',
    descriptionUz: 'Ingliz tilini noldan boshlab o\'rganish uchun mo\'ljallangan kurs. Alifbo, asosiy grammatika va kundalik so\'zlashuv ko\'nikmalari beriladi.',
    descriptionEn: 'A course designed for learning English from scratch. Covers the alphabet, basic grammar and everyday conversation skills.',
    descriptionRu: 'Курс для изучения английского языка с нуля. Алфавит, основная грамматика и повседневные разговорные навыки.',
    price: 400000,
    duration: '2 oy',
  },
  {
    code: 'A2',
    order: 2,
    icon: '🌿',
    titleUz: 'A2 — Elementary daraja',
    titleEn: 'A2 — Elementary level',
    titleRu: 'A2 — Элементарный уровень',
    descriptionUz: 'A1 darajasini tugatgan o\'quvchilar uchun davomiy kurs. So\'z boyligi va grammatika kengaytiriladi, erkin so\'zlashuv boshlanadi.',
    descriptionEn: 'A continuation course for students who completed A1. Vocabulary and grammar are expanded, free conversation begins.',
    descriptionRu: 'Продолжение для тех, кто завершил уровень A1. Расширяется словарный запас и грамматика, начинается свободное общение.',
    price: 450000,
    duration: '2 oy',
  },
  {
    code: 'CEFR_MULTILEVEL',
    order: 3,
    icon: '📚',
    titleUz: 'CEFR Multilevel',
    titleEn: 'CEFR Multilevel',
    titleRu: 'CEFR Мультиуровневый',
    descriptionUz: 'Umumiy Yevropa til kompetensiyalari (CEFR) asosida barcha darajalar (A1—C1) uchun moslashtirilgan bosqichli dastur.',
    descriptionEn: 'A staged program aligned with the Common European Framework of Reference (CEFR), adapted for all levels (A1—C1).',
    descriptionRu: 'Поэтапная программа на основе CEFR, адаптированная для всех уровней (A1—C1).',
    price: 500000,
    duration: '3 oy',
  },
  {
    code: 'IELTS_FOUNDATION',
    order: 4,
    icon: '🎓',
    titleUz: 'IELTS Foundation',
    titleEn: 'IELTS Foundation',
    titleRu: 'IELTS Foundation',
    descriptionUz: 'IELTS imtihoniga tayyorgarlikning boshlang\'ich bosqichi. Listening, Reading, Writing, Speaking bo\'yicha asos yaratiladi.',
    descriptionEn: 'The foundational stage of IELTS exam preparation. Builds the base for Listening, Reading, Writing and Speaking.',
    descriptionRu: 'Начальный этап подготовки к экзамену IELTS. Формирует базу по Listening, Reading, Writing и Speaking.',
    price: 600000,
    duration: '3 oy',
  },
  {
    code: 'MOCK_IELTS',
    order: 5,
    icon: '📝',
    titleUz: 'Mock IELTS test',
    titleEn: 'Mock IELTS test',
    titleRu: 'Пробный тест IELTS',
    descriptionUz: 'Haqiqiy IELTS imtihoni sharoitida o\'tkaziladigan sinov testi. Natija va tavsiyalar bilan birga beriladi.',
    descriptionEn: 'A trial test conducted under real IELTS exam conditions. Comes with results and personalised feedback.',
    descriptionRu: 'Пробный тест в условиях настоящего экзамена IELTS. Предоставляется результат и рекомендации.',
    price: 150000,
    duration: '1 kunlik',
  },
];

const achievements = [
  {
    order: 1,
    value: '2019',
    titleUz: 'yildan buyon faoliyatdamiz',
    titleEn: 'Operating since 2019',
    titleRu: 'Работаем с 2019 года',
    descriptionUz: 'Cosmos Academy 2019-yildan buyon sifatli ingliz tili ta\'limini taqdim etib kelmoqda.',
    descriptionEn: 'Cosmos Academy has been providing quality English education since 2019.',
    descriptionRu: 'Cosmos Academy предоставляет качественное образование по английскому языку с 2019 года.',
  },
  {
    order: 2,
    value: '500+',
    titleUz: 'bitiruvchi',
    titleEn: 'graduates',
    titleRu: 'выпускников',
    descriptionUz: 'Markazimizni 500 dan ortiq talaba muvaffaqiyatli tamomlagan.',
    descriptionEn: 'More than 500 students have successfully completed our center.',
    descriptionRu: 'Более 500 студентов успешно окончили наш центр.',
  },
  {
    order: 3,
    value: '7.0+',
    titleUz: 'IELTS bali olganlar',
    titleEn: 'IELTS score achievers',
    titleRu: 'Достигли балла IELTS',
    descriptionUz: '50 dan ortiq bitiruvchimiz IELTS imtihonida 7.0 va undan yuqori ball to\'plagan.',
    descriptionEn: 'More than 50 of our graduates scored 7.0 or higher on the IELTS exam.',
    descriptionRu: 'Более 50 наших выпускников набрали 7.0 и выше на экзамене IELTS.',
  },
  {
    order: 4,
    value: '15+',
    titleUz: 'tajribali o\'qituvchi',
    titleEn: 'experienced teachers',
    titleRu: 'опытных преподавателей',
    descriptionUz: 'Malakali va tajribali o\'qituvchilar jamoasi har bir o\'quvchiga individual yondashadi.',
    descriptionEn: 'A team of qualified, experienced teachers gives every student an individual approach.',
    descriptionRu: 'Команда квалифицированных и опытных преподавателей уделяет внимание каждому студенту.',
  },
];

const centerInfo = {
  id: 1,
  nameUz: 'Cosmos Academy',
  nameEn: 'Cosmos Academy',
  nameRu: 'Cosmos Academy',
  aboutUz: 'Cosmos Academy — 2019-yildan buyon faoliyat yuritayotgan ingliz tili o\'quv markazi. Biz umumiy ingliz tili (A1—C1), CEFR Multilevel va IELTS yo\'nalishlarida sifatli ta\'lim beramiz.',
  aboutEn: 'Cosmos Academy is an English language center operating since 2019. We provide quality education in General English (A1—C1), CEFR Multilevel and IELTS tracks.',
  aboutRu: 'Cosmos Academy — учебный центр английского языка, работающий с 2019 года. Мы предлагаем качественное образование по направлениям General English (A1—C1), CEFR Multilevel и IELTS.',
  phones: ['+998 90 123 45 67', '+998 91 234 56 78'],
  addressUz: 'Namunaviy manzil: Toshkent shahri, Yunusobod tumani, Amir Temur ko\'chasi',
  addressEn: 'Sample address: Tashkent city, Yunusabad district, Amir Temur street',
  addressRu: 'Пример адреса: город Ташкент, Юнусабадский район, улица Амира Темура',
  latitude: 41.311081,
  longitude: 69.240562,
  instagram: 'https://instagram.com/cosmos.academia',
  telegram: 'https://t.me/cosmosacademia',
  facebook: null,
  youtube: null,
  workHours: 'Dushanba—Shanba: 09:00—19:00',
  logoUrl: '/logo.jpg',
};

async function main() {
  const existingCourses = await prisma.course.count();
  if (existingCourses === 0) {
    for (const course of courses) {
      await prisma.course.create({ data: course });
    }
    console.log(`[seed] ${courses.length} ta kurs qo'shildi`);
  } else {
    console.log('[seed] Kurslar jadvali bo\'sh emas — o\'tkazib yuborildi');
  }

  const existingAchievements = await prisma.achievement.count();
  if (existingAchievements === 0) {
    for (const achievement of achievements) {
      await prisma.achievement.create({ data: achievement });
    }
    console.log(`[seed] ${achievements.length} ta yutuq qo'shildi`);
  } else {
    console.log('[seed] Yutuqlar jadvali bo\'sh emas — o\'tkazib yuborildi');
  }

  const existingCenterInfo = await prisma.centerInfo.findUnique({ where: { id: 1 } });
  if (!existingCenterInfo) {
    await prisma.centerInfo.create({ data: centerInfo });
    console.log('[seed] Markaz ma\'lumotlari qo\'shildi');
  } else {
    console.log('[seed] Markaz ma\'lumotlari mavjud — o\'tkazib yuborildi');
  }
}

main()
  .catch((err) => {
    console.error('[seed] Xatolik:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
