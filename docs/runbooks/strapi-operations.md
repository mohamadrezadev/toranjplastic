# راهنمای جامع عملیاتی سامانه مدیریت مقالات Strapi (Runbook)

این سند رویه‌های عملیاتی، پشتیبان‌گیری، بازیابی، چرخش کلیدها و پایش سلامت سامانه Strapi v5 در پروژه ترنج پلاستیک را تشریح می‌کند.

---

## ۱. معماری و ایزولاسیون

- **سرویس CMS:** در مسیر `cms/` بر پایه Strapi v5 و Node.js 24 قرار دارد.
- **دیتابیس اختصاصی:** دیتابیس `toranj_strapi` روی سرور PostgreSQL اختصاصی و کاملاً مستقل از دیتابیس اصلی `toranj` کار می‌کند.
- **دامنه محتوا:** Strapi منحصراً برای مقاله‌ها (`Article`)، دسته‌بندی‌ها (`Category`)، برچسب‌ها (`Tag`) و رسانه‌های مقالات به کار می‌رود و هیچ‌گونه منطق فروش، استعلام، قیمت‌گذاری یا داده مشتری در آن ذخیره نمی‌شود.
- **پورت پیش‌فرض:** پورت `1337` به صورت محلی و داخلی کانتینر در دسترس است.

---

## ۲. بررسی وضعیت سلامت (Health Check)

Strapi دارای اندپوینت توکار سبک برای پایش سلامت است:

```bash
# بررسی سلامت سرویس (پاسخ HTTP 204 No Content نشانه سلامت است)
curl -i http://localhost:1337/_health

# بررسی API عمومی مقالات
curl -i http://localhost:1337/api/articles
```

در داکر کامپوز، سلامت سرویس به صورت خودکار با دستور زیر بررسی می‌شود:
```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -q -O - http://127.0.0.1:1337/_health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## ۳. پشتیبان‌گیری و بازیابی دیتابیس (Backup & Restore)

### پشتیبان‌گیری از دیتابیس `toranj_strapi`

```bash
# تهیه نسخه پشتیبان با فرمت SQL
docker exec toranjplastic-postgres-1 pg_dump -U toranj -d toranj_strapi > ./backups/strapi_$(date +%Y%m%d_%H%M%S).sql
```

### بازیابی دیتابیس `toranj_strapi`

```bash
# قطع اتصال‌های جاری به دیتابیس strapi
docker exec toranjplastic-postgres-1 psql -U toranj -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'toranj_strapi' AND pid <> pg_backend_pid();"

# پاکسازی و بازسازی دیتابیس خالی
docker exec toranjplastic-postgres-1 psql -U toranj -d postgres -c "DROP DATABASE IF EXISTS toranj_strapi;"
docker exec toranjplastic-postgres-1 psql -U toranj -d postgres -c "CREATE DATABASE toranj_strapi;"

# بازیابی اطلاعات از فایل پشتیبان
docker exec -i toranjplastic-postgres-1 psql -U toranj -d toranj_strapi < ./backups/strapi_backup.sql
```

> **مهم:** دیتابیس هسته `toranj` هرگز نباید تحت تأثیر این دستورات قرار گیرد.

---

## ۴. پشتیبان‌گیری از فایل‌های آپلود (Media Uploads)

تمام فایل‌های بارگذاری‌شده در مسیر `cms/public/uploads` (یا volume داکر `strapi_uploads`) نگهداری می‌شوند.

```bash
# تهیه آرشیو از پوشه آپلودها
tar -czvf ./backups/strapi_uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C cms/public uploads

# بازیابی آپلودها
tar -xzvf ./backups/strapi_uploads_backup.tar.gz -C cms/public/
```

---

## ۵. بازتولید کش فرانت‌اند (Cache Revalidation & Webhooks)

Strapi با استفاده از وب‌هوک به اندپوینت `/api/revalidate` در فرانت‌اند Next.js سیگنال ارسال می‌کند.
- **هدر اعتبارسنجی:** `x-strapi-revalidate-secret`
- **متغیر محیطی مشترک:** `STRAPI_REVALIDATE_SECRET`

در صورت لزوم بازتولید دستی کش مقالات از سمت ادمین یا خط فرمان:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-strapi-revalidate-secret: <STRAPI_REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"model":"article","entry":{"slug":"<article-slug>"}}'
```

---

## ۶. چرخش کلیدهای امنیتی (Secret Rotation)

کلیدهای امنیتی زیر در فایل محیطی ریشه (`.env`) تعریف شده‌اند:
1. `STRAPI_APP_KEYS`: رشته‌های تصادفی با کاما جدا شده.
2. `STRAPI_API_TOKEN_SALT`: نمک توکن‌های محتوا.
3. `STRAPI_ADMIN_JWT_SECRET`: کلید امضای نشست‌های پنل ادمین.
4. `STRAPI_TRANSFER_TOKEN_SALT`: نمک انتقال داده.
5. `STRAPI_REVALIDATE_SECRET`: کلید مشترک وب‌هوک با فرانت‌اند.

برای چرخش کلیدها:
1. مقادیر جدید را با `openssl rand -base64 32` ایجاد و در `.env` ثبت کنید.
2. سرویس CMS را با دستور `pnpm start:cms` (یا بازراه‌اندازی کانتینر) مجدداً راه‌اندازی کنید.
3. پس از تغییر `STRAPI_ADMIN_JWT_SECRET`، مدیران باید مجدداً در پنل لاگین نمایند.
