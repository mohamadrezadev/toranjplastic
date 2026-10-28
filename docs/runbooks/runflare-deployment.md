# راهنمای استقرار پروژه ترنج پلاستیک روی ران‌فلر (Runflare Deployment Guide)

این راهنما گام‌به‌گام نحوه راه‌اندازی و دیپلوی کامل سیستم ترنج پلاستیک (Next.js، NestJS، Strapi v5 و PostgreSQL) روی پلتفرم ابری **ران‌فلر (Runflare)** را آموزش می‌دهد.

---

## ۱. ساختار سرویس‌های پروژه

پروژه از ۴ بخش تشکیل شده است:
1. **پایگاه‌داده (PostgreSQL 17):** شامل دو دیتابیس مستقل `toranj` (بک‌اند) و `toranj_strapi` (مقالات Strapi).
2. **بک‌اند (NestJS):** مدیریت کاربران، استعلام‌ها، پیش‌فاکتورها و رسانه‌ها روی پورت `3001`.
3. **سامانه مقالات (Strapi v5):** مدیریت محتوای وبلاگ و سئو روی پورت `1337`.
4. **فرانت‌اند (Next.js):** وب‌سایت عمومی، کاتالوگ و پنل کاربری روی پورت `3000`.

---

## روش اول: استقرار یکپارچه با Docker Compose (ساده‌ترین روش)

اگر در ران‌فلر از قابلیت **Docker Compose / Stack** یا سرور ابری استفاده می‌کنید:

### گام ۱: تعریف متغیرهای محیطی
در بخش تنظیمات متغیرهای محیطی ران‌فلر (Environment Variables)، مقادیر زیر را تنظیم کنید:
```env
POSTGRES_DB=toranj
POSTGRES_USER=toranj
POSTGRES_PASSWORD=یک_رمز_بسیار_قوی_و_تصادفی
STRAPI_DATABASE_NAME=toranj_strapi

# کلیدهای امنیتی بک‌اند
JWT_SECRET=یک_رشته_تصادفی_طولانی_برای_هش_توکن‌ها
SESSION_SECRET=یک_رشته_تصادفی_طولانی_برای_نشست‌ها

# کلیدهای امنیتی Strapi
STRAPI_APP_KEYS=key1_random,key2_random,key3_random,key4_random
STRAPI_API_TOKEN_SALT=salt_random_32char
STRAPI_ADMIN_JWT_SECRET=admin_jwt_secret_random
STRAPI_TRANSFER_TOKEN_SALT=transfer_salt_random
STRAPI_REVALIDATE_SECRET=کلید_اشتراکی_وب‌هوک_با_فرانت‌اند

# دامنه‌ها
MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
STRAPI_MEDIA_ORIGIN=https://cms.yourdomain.com
```

### گام ۲: اتصال به گیت‌هاب و دیپلوی
1. در پنل ران‌فلر، مخزن `https://github.com/mohamadrezadev/toranjplastic` را انتخاب کنید.
2. فایل `compose.yaml` را به عنوان فایل کامپوز تعیین نمایید.
3. در محیط محلی یا CI می‌توانید صحت کامپوز را با دستور زیر بررسی کنید:
   ```bash
   pnpm check:docker
   ```
4. دکمه **Deploy** را بزنید. هر ۴ سرویس بیلد و اجرا خواهند شد. سرویس فرانت‌اند به صورت خودکار تا رسیدن سرویس‌های بک‌اند و CMS به وضعیت سالم (`service_healthy`) منتظر می‌ماند.

---

## روش دوم: استقرار سرویس‌های جداگانه (PaaS Apps)

اگر قصد دارید هر بخش را به عنوان یک برنامه مستقل (App) در ران‌فلر بسازید:

### گام ۱: ساخت دیتابیس PostgreSQL
1. از منوی ران‌فلر، یک دیتابیس **PostgreSQL 17** ایجاد کنید.
2. وارد تب Query یا دسترسی کنسول دیتابیس شوید و دیتابیس دوم را بسازید:
   ```sql
   CREATE DATABASE toranj_strapi;
   ```
3. اطلاعات اتصال (Host, Port, User, Password) را یادداشت کنید.

---

### گام ۲: دیپلوی سرویس بک‌اند (NestJS)
1. در ران‌فلر یک سرویس از نوع **Docker / Git App** بسازید و ریپازیتوری را متصل کنید.
2. مسیر داکرفایل را برابر `backend/Dockerfile` قرار دهید.
3. پورت داخلی کانتینر را روی `3001` تنظیم کنید.
4. تنظیم پروب سلامت (Health Check):
   - نوع پروب: `HTTP GET`
   - مسیر پروب: `/api/v1/ready`
   - یا دستور ترمینال: `wget -q -O - http://127.0.0.1:3001/api/v1/ready || exit 1`
5. یک **دیسک ابری (Persistent Volume)** با ظرفیت دلخواه (مثلاً ۵ گیگابایت) بسازید و مسیر مانت آن را روی `/app/backend/media-uploads` قرار دهید (برای ذخیره فایل‌های آپلودی).
6. متغیرهای محیطی زیر را اضافه کنید:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `DATABASE_URL=postgresql://USER:PASS@DB_HOST:5432/toranj?schema=public`
   - `JWT_SECRET=...`
   - `SESSION_SECRET=...`
   - `MEDIA_STORAGE_ROOT=/app/backend/media-uploads`
   - `MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com`
7. اجرای مایگریشن اولیه: پس از دیپلوی، از تب ترمینال دستور `pnpm db:migrate:deploy` را اجرا کنید.
8. ساخت اولین مدیر: دستور `pnpm admin:bootstrap` را در کنسول اجرا کنید.
9. ساب‌دامنه خود مانند `api.yourdomain.com` را به این سرویس متصل کنید.

---

### گام ۳: دیپلوی سامانه مقالات (Strapi v5)
1. یک سرویس دیگر از نوع **Docker / Git App** بسازید.
2. مسیر داکرفایل را برابر `cms/Dockerfile` قرار دهید.
3. پورت داخلی کانتینر را روی `1337` تنظیم کنید.
4. تنظیم پروب سلامت (Health Check):
   - نوع پروب: `HTTP GET`
   - مسیر پروب: `/_health`
   - یا دستور ترمینال: `wget -q -O - http://127.0.0.1:1337/_health || exit 1`
5. یک **دیسک ابری (Persistent Volume)** بسازید و مسیر مانت آن را روی `/app/cms/public/uploads` قرار دهید (برای ماندگاری تصاویر مقالات).
6. متغیرهای محیطی را تنظیم کنید:
   - `NODE_ENV=production`
   - `PORT=1337`
   - `DATABASE_CLIENT=postgres`
   - `DATABASE_HOST=DB_HOST`
   - `DATABASE_PORT=5432`
   - `DATABASE_NAME=toranj_strapi`
   - `DATABASE_USERNAME=USER`
   - `DATABASE_PASSWORD=PASS`
   - `DATABASE_SSL=false`
   - `STRAPI_APP_KEYS=key1,key2,key3,key4`
   - `STRAPI_API_TOKEN_SALT=salt1`
   - `STRAPI_ADMIN_JWT_SECRET=secret1`
   - `STRAPI_TRANSFER_TOKEN_SALT=salt2`
   - `STRAPI_REVALIDATE_SECRET=کلید_اشتراکی_یکسان_با_فرانت‌اند`
   - `FRONTEND_REVALIDATE_URL=https://yourdomain.com/api/revalidate`
7. ساب‌دامنه مانند `cms.yourdomain.com` را به این سرویس متصل کنید.
8. پس از استقرار، به آدرس `https://cms.yourdomain.com/admin` بروید و کاربر ادمین را ثبت کنید.

---

### گام ۴: دیپلوی فرانت‌اند (Next.js)
1. سرویس آخر را از نوع **Docker / Git App** بسازید.
2. مسیر داکرفایل را برابر `frontend/Dockerfile` قرار دهید.
3. پورت کانتینر را روی `3000` تنظیم کنید.
4. آرگومان‌های بیلد (Build Arguments) در صورت نیاز به تزریق در زمان Build:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
   - `MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com`
   - `STRAPI_MEDIA_ORIGIN=https://cms.yourdomain.com`
5. تنظیم پروب سلامت (Health Check):
   - نوع پروب: `HTTP GET`
   - مسیر پروب: `/`
   - یا دستور ترمینال: `wget -q -O - http://127.0.0.1:3000 || exit 1`
6. متغیرهای محیطی:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
   - `BACKEND_API_URL=https://api.yourdomain.com/api/v1` (یا آدرس داخلی شبکه ران‌فلر)
   - `STRAPI_API_URL=https://cms.yourdomain.com` (یا آدرس داخلی شبکه ران‌فلر)
   - `MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com`
   - `STRAPI_MEDIA_ORIGIN=https://cms.yourdomain.com`
   - `STRAPI_REVALIDATE_SECRET=کلید_اشتراکی_یکسان_با_Strapi`
7. دامنه اصلی سایت مانند `yourdomain.com` و `www.yourdomain.com` را به این سرویس متصل کنید.

---

## ۴. بررسی نهایی پس از راه‌اندازی (Verification)
- دسترسی به صفحه اصلی: `https://yourdomain.com`
- دسترسی به مقالات: `https://yourdomain.com/articles`
- بررسی هلث بک‌اند: `https://api.yourdomain.com/api/v1/health`
- بررسی آمادگی سرویس (PostgreSQL و Media Storage): `https://api.yourdomain.com/api/v1/ready`
- بررسی هلث Strapi: `https://cms.yourdomain.com/_health`
- ورود به پنل ادمین وب‌سایت: `https://yourdomain.com/admin`
- ورود به پنل مدیریت Strapi: `https://cms.yourdomain.com/admin`

---

## ۵. راهنمای پشتیبان‌گیری هماهنگ دیتابیس و رسانه‌ها (Coordinated DB & Media Backup)

از آنجا که اطلاعات متادیتای رسانه‌ها در دیتابیس `toranj` و فایل‌های باینری تصاویر در دیسک مانت‌شده قرار دارند، بک‌آپ باید به صورت هماهنگ تهیه شود:

### تهیه پشتیبان همگام:
```bash
# ۱. تاریخ و شناسه بک‌آپ
BACKUP_ID=$(date +%Y%m%d_%H%M%S)

# ۲. خروجی دیتابیس PostgreSQL اصلی
docker exec toranjplastic-postgres-1 pg_dump -U toranj -d toranj > ./backups/toranj_db_${BACKUP_ID}.sql

# ۳. خروجی آرشیو رسانه‌های بک‌اند
tar -czvf ./backups/backend_media_${BACKUP_ID}.tar.gz -C /app/backend/media-uploads .

# ۴. ذخیره این دو فایل در فضای امن پشتیبان خارجی
```

### بازیابی و بازگردانی هماهنگ (Coordinated Restore):
```bash
# ۱. بازیابی دیتابیس در PostgreSQL
docker exec -i toranjplastic-postgres-1 psql -U toranj -d toranj < ./backups/toranj_db_${BACKUP_ID}.sql

# ۲. استخراج فایل‌های رسانه به دایرکتوری مانت
tar -xzvf ./backups/backend_media_${BACKUP_ID}.tar.gz -C /app/backend/media-uploads/

# ۳. بررسی آمادگی سرویس پس از بازیابی
curl -i https://api.yourdomain.com/api/v1/ready
```

---

## ۶. رویه مهاجرت رسانه بین فضاهای ذخیره‌سازی (Media Storage Migration & Rollback)

با استفاده از قابلیت توکار `MediaMaintenanceService`:
1. **تولید مانیفست قابل‌حمل (Manifest Export):**
   - خروجی مانیفست ساختاریافته شامل شناسه دارایی، کلید نسبی، ابعاد، حجم و هش SHA-256 تک‌تک گونه‌ها را ذخیره می‌کند.
2. **کپی و اعتبارسنجی جابه‌جایی (Copy & Verify):**
   - فایل‌ها از منبع به مقصد کپی شده و با هش مانیفست تطبیق داده می‌شوند. هرگونه مغایرت با خطا متوقف شده و فایل ناقص حذف می‌شود.
3. **رول‌بک ایمن و غیرمخرب (Non-destructive Rollback):**
   - فایل‌های مقصد اولیه در طول فرآیند به صورت Read-Only حفظ می‌شوند تا در صورت انصراف، بدون قطعی سرویس به دیسک اصلی بازگردد.

