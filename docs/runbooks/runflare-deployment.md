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
3. دکمه **Deploy** را بزنید. هر ۴ سرویس بیلد و اجرا خواهند شد.

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
4. یک **دیسک ابری (Persistent Volume)** با ظرفیت دلخواه (مثلاً ۵ گیگابایت) بسازید و مسیر مانت آن را روی `/app/backend/media-uploads` قرار دهید (برای ذخیره فایل‌های آپلودی).
5. متغیرهای محیطی زیر را اضافه کنید:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `DATABASE_URL=postgresql://USER:PASS@DB_HOST:5432/toranj?schema=public`
   - `JWT_SECRET=...`
   - `SESSION_SECRET=...`
   - `MEDIA_STORAGE_ROOT=/app/backend/media-uploads`
   - `MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com`
6. اجرای مایگریشن اولیه: پس از دیپلوی، از تب ترمینال دستور `pnpm db:migrate:deploy` را اجرا کنید.
7. ساخت اولین مدیر: دستور `pnpm admin:bootstrap` را در کنسول اجرا کنید.
8. ساب‌دامنه خود مانند `api.yourdomain.com` را به این سرویس متصل کنید.

---

### گام ۳: دیپلوی سامانه مقالات (Strapi v5)
1. یک سرویس دیگر از نوع **Docker / Git App** بسازید.
2. مسیر داکرفایل را برابر `cms/Dockerfile` قرار دهید.
3. پورت داخلی کانتینر را روی `1337` تنظیم کنید.
4. یک **دیسک ابری (Persistent Volume)** بسازید و مسیر مانت آن را روی `/app/cms/public/uploads` قرار دهید (برای ماندگاری تصاویر مقالات).
5. متغیرهای محیطی را تنظیم کنید:
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
6. ساب‌دامنه مانند `cms.yourdomain.com` را به این سرویس متصل کنید.
7. پس از استقرار، به آدرس `https://cms.yourdomain.com/admin` بروید و کاربر ادمین را ثبت کنید.

---

### گام ۴: دیپلوی فرانت‌اند (Next.js)
1. سرویس آخر را از نوع **Docker / Git App** بسازید.
2. مسیر داکرفایل را برابر `frontend/Dockerfile` قرار دهید.
3. پورت کانتینر را روی `3000` تنظیم کنید.
4. متغیرهای محیطی:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
   - `BACKEND_API_URL=https://api.yourdomain.com/api/v1` (یا آدرس داخلی شبکه ران‌فلر)
   - `STRAPI_API_URL=https://cms.yourdomain.com` (یا آدرس داخلی شبکه ران‌فلر)
   - `MEDIA_PUBLIC_ORIGIN=https://api.yourdomain.com`
   - `STRAPI_MEDIA_ORIGIN=https://cms.yourdomain.com`
   - `STRAPI_REVALIDATE_SECRET=کلید_اشتراکی_یکسان_با_Strapi`
5. دامنه اصلی سایت مانند `yourdomain.com` و `www.yourdomain.com` را به این سرویس متصل کنید.

---

## ۴. بررسی نهایی پس از راه‌اندازی (Verification)
- دسترسی به صفحه اصلی: `https://yourdomain.com`
- دسترسی به مقالات: `https://yourdomain.com/articles`
- بررسی هلث بک‌اند: `https://api.yourdomain.com/api/v1/health`
- بررسی هلث Strapi: `https://cms.yourdomain.com/_health`
- ورود به پنل ادمین وب‌سایت: `https://yourdomain.com/admin`
- ورود به پنل مدیریت Strapi: `https://cms.yourdomain.com/admin`
