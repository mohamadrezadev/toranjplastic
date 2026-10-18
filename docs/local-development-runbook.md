# راهنمای اجرای محلی ترنج پلاستیک

این راهنما برای اجرای Frontend، Backend و PostgreSQL در محیط توسعه است. تمام دستورها باید از ریشه مخزن اجرا شوند.

## پیش‌نیازها

- Node.js نسخه `24.11` یا بالاتر
- pnpm نسخه `9.15` یا بالاتر
- Docker Desktop با Docker Compose

نسخه ابزارها را بررسی کنید:

```powershell
node --version
pnpm --version
docker --version
docker compose version
```

اگر PowerShell اجرای `pnpm.ps1` را مسدود کرد، در تمام دستورهای این سند به‌جای `pnpm` از `pnpm.cmd` استفاده کنید.

## راه‌اندازی برای اولین بار

### ۱. ساخت فایل تنظیمات محلی

```powershell
Copy-Item .env.example .env
```

مقادیر `.env` را برای محیط خود تنظیم کنید. حداقل این بخش‌ها باید صحیح باشند:

- `FRONTEND_PORT` و `BACKEND_PORT`
- `POSTGRES_DB`، `POSTGRES_USER`، `POSTGRES_PASSWORD` و `POSTGRES_PORT`
- `DATABASE_URL` مطابق همان نام، کاربر، رمز و پورت PostgreSQL
- `FRONTEND_ORIGIN`، `NEXT_PUBLIC_API_URL` و `BACKEND_API_URL`
- `BOOTSTRAP_ADMIN_MOBILE`، `BOOTSTRAP_ADMIN_DISPLAY_NAME` و `BOOTSTRAP_ADMIN_PASSWORD`
- تنظیمات `MEDIA_*`، مخصوصاً مسیر مطلق و قابل‌نوشتن `MEDIA_ROOT`

فایل `.env` حاوی secret است و نباید commit شود.

### ۲. نصب dependencyها

```powershell
pnpm install
```

### ۳. اجرای PostgreSQL

```powershell
docker compose up -d postgres
docker compose ps
```

PostgreSQL به‌صورت پیش‌فرض فقط روی `127.0.0.1:5433` منتشر می‌شود. مقدار پورت از `POSTGRES_PORT` خوانده می‌شود.

### ۴. آماده‌سازی دیتابیس

```powershell
pnpm db:generate
pnpm db:migrate:deploy
```

دستور `db:migrate:deploy` migrationهای موجود را اجرا می‌کند. برای ساخت migration جدید در جریان توسعه از `pnpm db:migrate` استفاده کنید.

### ۵. ساخت ادمین اولیه

این دستور را فقط یک بار، پس از ساخت دیتابیس تازه اجرا کنید:

```powershell
pnpm admin:bootstrap
```

اطلاعات ادمین از `BOOTSTRAP_ADMIN_*` در `.env` خوانده می‌شود. اگر ادمین قبلاً وجود داشته باشد، اجرای مجدد با `ADMIN_ALREADY_EXISTS` متوقف می‌شود.

### ۶. اجرای Frontend و Backend

```powershell
pnpm dev
```

این دستور `.env` ریشه را بارگذاری می‌کند و هر دو برنامه را هم‌زمان اجرا می‌کند:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend health: `http://localhost:3001/api/v1/health`

برای اجرای جداگانه:

```powershell
pnpm dev:backend
pnpm dev:frontend
```

## اجرای روزمره

در شروع کار:

```powershell
docker compose up -d postgres
pnpm dev
```

اگر migration جدیدی دریافت شده است، پیش از `pnpm dev` این دستور را اجرا کنید:

```powershell
pnpm db:migrate:deploy
```

## توقف سرویس‌ها

برای توقف Frontend و Backend در ترمینالی که `pnpm dev` اجرا شده است، `Ctrl+C` را بزنید.

برای پایین‌آوردن PostgreSQL و حفظ داده‌ها:

```powershell
docker compose down
```

دستور بالا کانتینر را حذف می‌کند ولی volume دیتابیس را نگه می‌دارد. اجرای بعدی `docker compose up -d postgres` همان داده‌ها را برمی‌گرداند.

## ساخت دیتابیس کاملاً تازه

هشدار: دستور زیر تمام داده‌های PostgreSQL این پروژه را غیرقابل‌بازیابی حذف می‌کند.

```powershell
docker compose down --volumes
docker compose up -d postgres
pnpm db:migrate:deploy
pnpm admin:bootstrap
```

## بررسی سلامت سرویس‌ها

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/auth/login
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/api/v1/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/api/v1/public/content/categories
docker compose ps
```

دو درخواست اول روشن‌بودن برنامه‌ها را بررسی می‌کنند. درخواست `categories` علاوه بر Backend، اتصال واقعی به PostgreSQL را نیز بررسی می‌کند.

## تنظیمات آپلود مدیا

```dotenv
MEDIA_MAX_UPLOAD_BYTES=10485760
MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES=11534336
```

- `MEDIA_MAX_UPLOAD_BYTES` حداکثر اندازه واقعی فایل در Backend است.
- `MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES` سقف درخواست در Next.js است و باید برای سربار `multipart/form-data` از مقدار Backend بزرگ‌تر باشد.
- پس از تغییر این مقادیر، `pnpm dev` را restart کنید.

## خطاهای رایج

### `ECONNREFUSED 127.0.0.1:3001`

Backend اجرا نشده یا روی پورت دیگری است. `pnpm dev:backend` و مقدار `BACKEND_PORT` را بررسی کنید.

### خطای Prisma با کد `P1000`

PostgreSQL رمز یا کاربر موجود در `DATABASE_URL` را قبول نمی‌کند. مقادیر `POSTGRES_*` و `DATABASE_URL` باید با هم هماهنگ باشند. تغییر رمز در `.env`، رمز volume قبلاً ساخته‌شده را عوض نمی‌کند؛ یا رمز دیتابیس را به‌صورت کنترل‌شده تغییر دهید یا طبق بخش «ساخت دیتابیس کاملاً تازه» volume را بازسازی کنید.

### خطای `Body exceeded ... limit`

مقدار `MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES` را بررسی کنید. این مقدار باید از `MEDIA_MAX_UPLOAD_BYTES` بزرگ‌تر باشد.

### خطای `MEDIA_STORAGE_UNAVAILABLE`

مسیر `MEDIA_ROOT` باید مطلق، موجود و برای Backend قابل خواندن و نوشتن باشد. برنامه به storage موقت دیگری fallback نمی‌کند.

## دستورات کنترل کیفیت

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

