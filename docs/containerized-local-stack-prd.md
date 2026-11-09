# PRD اجرای یکپارچه محلی ترنج پلاستیک با Docker Compose

> **شناسه:** TORANJ-PRD-DEVOPS-001
> **نسخه:** 1.0 — Approved for OpenSpec planning
> **تاریخ:** 2026-11-09 / ۱۴۰۵-۰۸-۱۸
> **دامنه:** محیط توسعه و ارزیابی محلی؛ نه استقرار production

## 1. تصمیم نهایی

مخزن باید یک `compose.yaml` نسخه‌گذاری‌شده ارائه کند که PostgreSQL 17، Backend، Strapi CMS و Frontend را از ریشه مخزن build و اجرا کند. اجرای پیش‌فرض برای توسعه و ارزیابی محلی است و باید با یک فایل `.env` خارج از Git، volumeهای پایدار، healthcheck و ترتیب راه‌اندازی قطعی کار کند.

## 2. مسئله

سه Dockerfile سرویس‌ها موجود است و مستندات به `compose.yaml` اشاره می‌کنند، اما فایل Compose در مخزن وجود ندارد. در نتیجه دستور مستندشده `docker compose up --build -d` قابل استفاده نیست و اتصال سرویس‌ها با مقادیر `localhost` داخل کانتینرها شکست می‌خورد.

## 3. هدف‌ها

- اجرای کل stack با یک دستور از ریشه مخزن.
- حفظ دیتابیس NestJS و دیتابیس Strapi به‌صورت کاملاً جدا در PostgreSQL.
- اجرای migrationهای Prisma پیش از آماده‌شدن Backend.
- حفظ داده‌های PostgreSQL، Media Backend و Uploadهای Strapi میان restartها.
- استفاده از healthcheck و dependency condition به‌جای تأخیر زمانی حدسی.
- انتشار پورت‌ها فقط روی loopback سیستم میزبان در اجرای محلی.
- مستندسازی bootstrap، مشاهده log، توقف و حذف اختیاری داده‌ها.

## 4. خارج از دامنه

- TLS، reverse proxy، CDN یا دامنه production.
- orchestration با Kubernetes یا Swarm.
- مدیریت secret production یا ساخت credential واقعی.
- اجرای خودکار bootstrap ادمین NestJS بدون ورودی صریح اپراتور.
- تغییر قراردادهای محصول، API یا schema تجاری.

## 5. سرویس‌ها و وابستگی‌ها

### PostgreSQL

- image رسمی PostgreSQL 17 Alpine.
- دیتابیس اصلی از `POSTGRES_DB` و دیتابیس مستقل CMS از `STRAPI_DATABASE_NAME` ساخته شود.
- volume پایدار برای `/var/lib/postgresql/data`.
- healthcheck با `pg_isready`.
- پورت میزبان فقط روی `127.0.0.1:${POSTGRES_PORT}` منتشر شود.

### Migration

- از stage دارای Prisma CLI در Dockerfile Backend استفاده کند.
- پس از سلامت PostgreSQL اجرا شود.
- با موفقیت خاتمه یابد و Backend به `service_completed_successfully` وابسته باشد.

### Backend

- روی `0.0.0.0:3001` گوش دهد.
- با نام سرویس `postgres` به دیتابیس متصل شود.
- Media در volume پایدار و مسیر مطلق داخل کانتینر ذخیره شود.
- readiness آن اتصال PostgreSQL و Media Storage را بررسی کند.

### Strapi CMS

- به دیتابیس مستقل `toranj_strapi` روی سرویس `postgres` متصل شود.
- Uploadها در volume پایدار نگهداری شوند.
- webhook بازاعتبارسنجی را با نام سرویس `frontend` فراخوانی کند.

### Frontend

- درخواست‌های server-side را با نام سرویس‌های `backend` و `cms` ارسال کند.
- URLهای قابل مشاهده مرورگر همچنان از `localhost` و پورت‌های منتشرشده استفاده کنند.
- پس از سلامت Backend و CMS اجرا شود.

## 6. امنیت و داده

- `.env` و secretهای واقعی وارد image یا Git نشوند.
- مقادیر نمونه فقط برای local development باشند و به‌عنوان production معرفی نشوند.
- سرویس‌های محلی روی loopback منتشر شوند.
- Compose نباید داده، قیمت، موجودی یا credential محصولی جدید ایجاد کند.
- حذف volumeها فقط با دستور صریح و مستند `docker compose down --volumes` انجام شود.

## 7. معیارهای پذیرش

1. `docker compose config --quiet` بدون خطا پاس شود.
2. build context هر سه application از ریشه monorepo باشد و lockfile frozen باقی بماند.
3. PostgreSQL دو دیتابیس جدا برای Backend و CMS بسازد.
4. migration پیش از Backend با exit code صفر تکمیل شود.
5. سرویس‌های `postgres`، `backend`، `cms` و `frontend` healthy شوند.
6. `http://127.0.0.1:3001/api/v1/health` پاسخ موفق بدهد.
7. `http://127.0.0.1:3000` و `http://127.0.0.1:1337/admin` قابل دسترسی باشند.
8. restart معمولی داده‌های volumeها را حذف نکند.
9. راهنمای محلی با مسیر Compose کامل، log، bootstrap و teardown هم‌راستا شود.

## 8. Rollback

Rollback کد با بازگرداندن `compose.yaml`، اسکریپت init و تغییرات Dockerfile/مستندات انجام می‌شود. volumeهای موجود در rollback خودکار حذف نمی‌شوند. حذف داده فقط با تأیید اپراتور و دستور صریح `docker compose down --volumes` مجاز است.

## 9. Definition of Done

- OpenSpec Change معتبر و taskهای آن کامل باشد.
- Compose parse و build شود.
- healthcheckها و ترتیب migration در اجرای واقعی اثبات شوند.
- سرویس‌های اصلی از میزبان قابل دسترسی باشند.
- مستندات و `.env.example` با پیاده‌سازی یکسان باشند.
