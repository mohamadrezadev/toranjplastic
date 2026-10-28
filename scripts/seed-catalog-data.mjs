import { Client } from 'pg';

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://toranj:toranj-local-dev@127.0.0.1:5433/toranj?schema=public';

async function seed() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  console.log('Connected to PostgreSQL for catalog seeding...');

  // 1. Seed Materials
  const materials = [
    {
      id: 'catalog-material-pp-homo',
      name: 'پلی‌پروپیلن هموپلیمر (PP-H)',
      slug: 'polypropylene-homopolymer',
      family: 'پلی‌پروپیلن (PP)',
      grade: 'HP550J / V30S',
      manufacturer: 'پتروشیمی جم / مارون',
      summary: 'پلیمر ترموپلاستیک با استحکام کششی و صلبیت بالا، مناسب برای تولید قطعات دقیق تزریقی، لوازم خانگی و درپوش‌های پلاستیکی.',
      description: 'پلی‌پروپیلن هموپلیمر یکی از پرکاربردترین پلیمرها در خط تولید قطعات تزریقی ترنج پلاستیک است. این ماده به دلیل مقاومت شیمیایی خوب در برابر اسیدها و بازها، دمای تغییر شکل حرارتی مناسب و جریان‌پذیری مطلوب مذاب، انتخابی ایده‌آل برای قطعات صنعتی و آشپزخانه محسوب می‌شود.\n\nتأمین این ماده به همراه برگه فنی آنالیز (CoA) معتبر انجام می‌گیرد و کارشناسان فنی ترنج پلاستیک آماده بررسی نقشه قالب شما برای تطبیق با رفتار انقباضی (Shrinkage) این گرید هستند.',
      images: JSON.stringify([{ url: '/branding/banners/materials.png', alt: 'پلی‌پروپیلن هموپلیمر ترنج', width: 1122, height: 1402 }]),
      specifications: JSON.stringify([
        { label: 'شاخص جریان مذاب (MFR)', value: '3.2 g/10min' },
        { label: 'مدول خمش (Flexural Modulus)', value: '1500 MPa' },
        { label: 'استحکام کششی (Tensile Strength)', value: '34 MPa' },
        { label: 'دمای تغییر شکل حرارتی (HDT)', value: '95 °C' },
        { label: 'درصد جمع‌شدگی قالب (Shrinkage)', value: '1.2 - 1.8 %' },
      ]),
      displayOrder: 10,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      inquiryAvailable: true,
      metaTitle: 'پلی‌پروپیلن هموپلیمر (PP-H) | ترنج پلاستیک',
      metaDescription: 'مشخصات فنی و دیتاشیت پلی‌پروپیلن هموپلیمر تزریقی مناسب لوازم خانگی و صنعتی.',
    },
    {
      id: 'catalog-material-pp-copo',
      name: 'پلی‌پروپیلن کوپلیمر ضربه‌پذیر (PP-C)',
      slug: 'polypropylene-copolymer',
      family: 'پلی‌پروپیلن (PP)',
      grade: 'EP440L / EP548R',
      manufacturer: 'پتروشیمی شازند / جم',
      summary: 'کوپلیمر هتروفازیک با مقاومت فوق‌العاده در برابر ضربه در دماهای پایین، مناسب برای بدنه باتری، سطل‌های صنعتی و قطعات مقاوم خودرویی.',
      description: 'این گرید برای قطعاتی که نیاز به مقاومت به ضربه بالا در شرایط سرد یا شوک مکانیکی دارند توسعه یافته است. ترنج پلاستیک این گرید را برای تولید قطعات صنعتی سنگین، سطل‌های رنگ صنعتی و جعبه‌های ابزار توصیه می‌کند.',
      images: JSON.stringify([{ url: '/branding/banners/materials.png', alt: 'پلی‌پروپیلن کوپلیمر ترنج', width: 1122, height: 1402 }]),
      specifications: JSON.stringify([
        { label: 'شاخص جریان مذاب (MFR)', value: '6.0 g/10min' },
        { label: 'مقاومت به ضربه ایزود (23°C)', value: '11 kJ/m²' },
        { label: 'مقاومت به ضربه ایزود (-20°C)', value: '5.5 kJ/m²' },
        { label: 'استحکام تسلیم کششی', value: '26 MPa' },
      ]),
      displayOrder: 20,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      inquiryAvailable: true,
      metaTitle: 'پلی‌پروپیلن کوپلیمر ضربه‌پذیر | ترنج پلاستیک',
      metaDescription: 'دیتاشیت و استعلام پلی‌پروپیلن کوپلیمر مقاوم به ضربه برای قطعات خودرویی و صنعتی.',
    },
    {
      id: 'catalog-material-hdpe',
      name: 'پلی‌اتیلن سنگین تزریقی و بادی (HDPE)',
      slug: 'high-density-polyethylene',
      family: 'پلی‌اتیلن (PE)',
      grade: 'HD52518 / BL3',
      manufacturer: 'پتروشیمی تبریز / ایلام',
      summary: 'پلی‌اتیلن با دانسیته بالا، مقاومت شیمیایی ممتاز و چقرمگی عالی برای انواع گالن، درپوش پیچی و اتصالات صنعتی.',
      description: 'پلی‌اتیلن سنگین (HDPE) به دلیل ساختار کریستالی فشرده، مقاومت به سایش و نفوذناپذیری بالا شناخته می‌شود. این گرید در تولید محصولات بهداشتی، صنعتی و انواع ظروف مایعات عملکردی بی‌نقص ارائه می‌دهد.',
      images: JSON.stringify([{ url: '/branding/banners/materials.png', alt: 'پلی‌اتیلن سنگین ترنج', width: 1122, height: 1402 }]),
      specifications: JSON.stringify([
        { label: 'چگالی (Density)', value: '0.952 g/cm³' },
        { label: 'شاخص جریان مذاب (190°C)', value: '18 g/10min' },
        { label: 'مقاومت به ترک تنشی محیطی (ESCR)', value: '> 40 hr' },
      ]),
      displayOrder: 30,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      inquiryAvailable: true,
      metaTitle: 'پلی‌اتیلن سنگین (HDPE) | ترنج پلاستیک',
      metaDescription: 'بررسی مشخصات فنی و استعلام پلی‌اتیلن سنگین برای تولید مخازن و قطعات پلاستیکی.',
    },
  ];

  for (const m of materials) {
    await client.query(
      `INSERT INTO "Material" (
        "id", "name", "slug", "family", "grade", "manufacturer", "summary",
        "description", "images", "specifications", "displayOrder", "status",
        "publishedAt", "inquiryAvailable", "metaTitle", "metaDescription",
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "family" = EXCLUDED."family",
        "grade" = EXCLUDED."grade",
        "manufacturer" = EXCLUDED."manufacturer",
        "summary" = EXCLUDED."summary",
        "description" = EXCLUDED."description",
        "images" = EXCLUDED."images",
        "specifications" = EXCLUDED."specifications",
        "status" = EXCLUDED."status",
        "publishedAt" = EXCLUDED."publishedAt",
        "inquiryAvailable" = EXCLUDED."inquiryAvailable",
        "metaTitle" = EXCLUDED."metaTitle",
        "metaDescription" = EXCLUDED."metaDescription",
        "updatedAt" = NOW()`,
      [
        m.id,
        m.name,
        m.slug,
        m.family,
        m.grade,
        m.manufacturer,
        m.summary,
        m.description,
        m.images,
        m.specifications,
        m.displayOrder,
        m.status,
        m.publishedAt,
        m.inquiryAvailable,
        m.metaTitle,
        m.metaDescription,
      ]
    );
    console.log(`Seeded Material: ${m.name} (${m.slug})`);
  }

  // 2. Seed InjectionServices
  await client.query('DELETE FROM "InjectionService" WHERE "slug" = $1', ['mold-making-consultation']);

  const services = [
    {
      id: 'catalog-service-precision-injection',
      name: 'خدمات تزریق پلاستیک کارمزدی (با قالب مشتری)',
      slug: 'precision-injection',
      summary: 'پذیرش قالب و تولید قطعات پلاستیکی با دستگاه‌های تزریق ۸۰ تا ۴۵۰ تن در کهریزک تهران، با مواد اولیه ارسالی شما یا متریال تأمینی ترنج.',
      description: 'صنایع پلاستیک ترنج با در اختیار داشتن خطوط متنوع ماشین‌آلات تزریق پلاستیک هیدرولیک و سروو در بازه تناژ ۸۰ الی ۴۵۰ تن مستقر در کهریزک تهران، آماده ارائه خدمات تزریق پلاستیک کارمزدی (اجرت تزریق) به شرکت‌ها، کارگاه‌ها و صاحبان قالب است.\n\nدر این مدل همکاری، مشتریان قالب اختصاصی خود را جهت تولید به مجموعه ترنج پلاستیک می‌سپارند. تأمین مواد اولیه پلیمری نیز می‌تواند مستقیماً توسط مشتری ارسال گردد یا در صورت نیاز، از گریدهای پلیمری تأمینی ترنج پلاستیک استفاده شود.\n\nتعهد ما تنظیم دقیق پارامترهای تزریق، کنترل ثبات وزن قطعه و تحویل به‌موقع سفارش‌ها درب کارخانه است.',
      images: JSON.stringify([{ url: '/branding/banners/injection-services.png', alt: 'خدمات تزریق پلاستیک کارمزدی ترنج', width: 1122, height: 1402 }]),
      specifications: JSON.stringify([
        { label: 'ظرفیت تناژ دستگاه‌ها', value: '80T - 450T' },
        { label: 'حداکثر وزن تزریق (شات)', value: '1500 g' },
        { label: 'مدل همکاری', value: 'تزریق کارمزدی با قالب مشتری' },
        { label: 'تأمین مواد اولیه', value: 'ارسالی مشتری یا تأمین ترنج' },
      ]),
      ctaLabel: 'ثبت استعلام تزریق با قالب مشتری',
      ctaHref: '/inquiry/injection?slug=precision-injection',
      displayOrder: 10,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      metaTitle: 'خدمات تزریق پلاستیک کارمزدی | صنایع پلاستیک ترنج',
      metaDescription: 'خدمات تزریق پلاستیک کارمزدی و اجرت تزریق با قالب مشتری در تناژهای ۸۰ تا ۴۵۰ تن در کهریزک تهران.',
    },
  ];

  for (const s of services) {
    await client.query(
      `INSERT INTO "InjectionService" (
        "id", "name", "slug", "summary", "description", "images", "specifications",
        "ctaLabel", "ctaHref", "displayOrder", "status", "publishedAt",
        "metaTitle", "metaDescription", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "summary" = EXCLUDED."summary",
        "description" = EXCLUDED."description",
        "images" = EXCLUDED."images",
        "specifications" = EXCLUDED."specifications",
        "ctaLabel" = EXCLUDED."ctaLabel",
        "ctaHref" = EXCLUDED."ctaHref",
        "status" = EXCLUDED."status",
        "publishedAt" = EXCLUDED."publishedAt",
        "metaTitle" = EXCLUDED."metaTitle",
        "metaDescription" = EXCLUDED."metaDescription",
        "updatedAt" = NOW()`,
      [
        s.id,
        s.name,
        s.slug,
        s.summary,
        s.description,
        s.images,
        s.specifications,
        s.ctaLabel,
        s.ctaHref,
        s.displayOrder,
        s.status,
        s.publishedAt,
        s.metaTitle,
        s.metaDescription,
      ]
    );
    console.log(`Seeded InjectionService: ${s.name} (${s.slug})`);
  }

  // 3. Seed ManagedPages (About & Contact)
  const pages = [
    {
      id: 'managed-page-about',
      title: 'صنایع پلاستیک ترنج',
      slug: 'about',
      summary: 'تولیدکننده محصولات پلاستیکی، ارائه‌دهنده خدمات تزریق پلاستیک کارمزدی (با قالب مشتری) در تناژهای ۸۰ تا ۴۵۰ تن و تأمین‌کننده مواد اولیه پلیمری در کهریزک تهران.',
      body: `صنایع پلاستیک ترنج در سه حوزه مشخص تولیدی و بازرگانی در منطقه کهریزک تهران فعالیت می‌کند:

۱. تولید و فروش محصولات کاتالوگ ترنج پلاستیک: انواع ظروف آشپزخانه، قطعات بهداشتی، بسته‌بندی و قطعات پلاستیکی که با قالب‌های اختصاصی موجود کارخانه تولید و به صورت عمده و در تیراژهای مختلف به خریداران عرضه می‌شوند.

۲. خدمات تزریق پلاستیک کارمزدی (اجرت تزریق با قالب مشتری): شرکت‌ها، کارگاه‌ها و مشتریان می‌توانند قالب‌های اختصاصی خود را جهت تولید به خطوط مجهز ترنج پلاستیک بسپارند. خطوط تولید ما مجهز به ماشین‌آلات تزریق در بازه تناژ ۸۰ الی ۴۵۰ تن است و عملیات تزریق با مواد اولیه ارسالی مشتری یا مواد تأمینی ترنج با دقت و پایداری بالا انجام می‌گیرد (توجه: ترنج پلاستیک خدمات ساخت قالب انجام نمی‌دهد).

۳. تأمین مواد اولیه پلیمری: تأمین و توزیع مستقیم انواع گریدهای پلی‌پروپیلن (PP)، پلی‌اتیلن (PE) و سایر پلیمرهای مصرفی صنایع پلاستیک همراه با مشاوره انتخاب گرید متناسب با کاربری قطعه.`,
      images: JSON.stringify([{ url: '/branding/banners/about.png', alt: 'خط تولید و ماشین‌آلات تزریق پلاستیک ترنج', width: 1200, height: 800 }]),
      displayOrder: 10,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      metaTitle: 'درباره ما | صنایع پلاستیک ترنج — خطوط تولید و خدمات تزریق در کهریزک',
      metaDescription: 'معرفی کارخانه و خطوط تولید صنایع پلاستیک ترنج در کهریزک تهران، محصولات اختصاصی، خدمات تزریق کارمزدی ۸۰ تا ۴۵۰ تن و تأمین مواد پلیمری.',
    },
    {
      id: 'managed-page-contact',
      title: 'تماس با صنایع پلاستیک ترنج',
      slug: 'contact',
      summary: 'راه‌های ارتباط مستقیم با کارخانه ترنج پلاستیک در کهریزک تهران جهت خرید عمده محصولات، خدمات تزریق کارمزدی و تأمین مواد پلیمری.',
      body: `واحدهای فروش و پذیرش سفارشات صنایع پلاستیک ترنج در تمامی روزهای کاری آماده پاسخگویی و صدور پیش‌فاکتور رسمی هستند:

- واحد فروش محصولات کاتالوگ و سفارش عمده: ۰۹۱۳۲۰۷۵۹۲۵ | ۰۹۱۲۲۰۰۹۵۱۵
- پشتیبانی فنی وب‌سایت: ۰۹۱۰۴۵۰۰۰۸۶
- واحد تأمین مواد اولیه پلیمری و مکاتبات رسمی: info@toranjplastic.com

نشانی کارخانه: تهران، کهریزک، مجتمع تولیدی صنایع پلاستیک ترنج
ساعات کاری: شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ | پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰`,
      images: JSON.stringify([{ url: '/branding/banners/contact.png', alt: 'دفتر و کارخانه ترنج پلاستیک', width: 1200, height: 800 }]),
      displayOrder: 20,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-10-15T00:00:00.000Z'),
      metaTitle: 'تماس با ما | صنایع پلاستیک ترنج — فروش محصولات، تزریق کارمزدی و مواد پلیمری',
      metaDescription: 'شماره‌های تماس مستقیم واحد فروش و تزریق کارمزدی، نشانی کارخانه در کهریزک تهران و ساعات کاری ترنج پلاستیک.',
    },
  ];

  for (const p of pages) {
    await client.query(
      `INSERT INTO "ManagedPage" (
        "id", "title", "slug", "summary", "body", "images",
        "displayOrder", "status", "publishedAt",
        "metaTitle", "metaDescription", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "summary" = EXCLUDED."summary",
        "body" = EXCLUDED."body",
        "images" = EXCLUDED."images",
        "displayOrder" = EXCLUDED."displayOrder",
        "status" = EXCLUDED."status",
        "publishedAt" = EXCLUDED."publishedAt",
        "metaTitle" = EXCLUDED."metaTitle",
        "metaDescription" = EXCLUDED."metaDescription",
        "updatedAt" = NOW()`,
      [
        p.id,
        p.title,
        p.slug,
        p.summary,
        p.body,
        p.images,
        p.displayOrder,
        p.status,
        p.publishedAt,
        p.metaTitle,
        p.metaDescription,
      ]
    );
    console.log(`Seeded ManagedPage: ${p.title} (${p.slug})`);
  }

  await client.end();
  console.log('Catalog seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
