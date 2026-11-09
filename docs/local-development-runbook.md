# راهنمای اجرای محلی ترنج پلاستیک

این راهنما دو روش اجرای محلی را پوشش می‌دهد: stack کامل Docker Compose و اجرای hybrid با PostgreSQL در Docker و برنامه‌ها روی میزبان. تمام دستورها باید از ریشه مخزن اجرا شوند.

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

## راه‌اندازی کامل با Docker Compose

### ۱. ساخت فایل تنظیمات محلی

```powershell
Copy-Item .env.example .env
```

مقادیر `.env` را برای محیط خود تنظیم کنید. حداقل این بخش‌ها باید صحیح باشند:

- `FRONTEND_PORT` و `BACKEND_PORT`
- `POSTGRES_DB`، `POSTGRES_USER`، `POSTGRES_PASSWORD` و `POSTGRES_PORT`
- `STRAPI_DATABASE_NAME` که باید با `POSTGRES_DB` متفاوت باشد
- `DATABASE_URL` مطابق همان نام، کاربر، رمز و پورت PostgreSQL
- `FRONTEND_ORIGIN`، `NEXT_PUBLIC_API_URL` و `BACKEND_API_URL`
- `BOOTSTRAP_ADMIN_MOBILE`، `BOOTSTRAP_ADMIN_DISPLAY_NAME` و `BOOTSTRAP_ADMIN_PASSWORD`
- تنظیمات `MEDIA_*`، مخصوصاً مسیر مطلق و قابل‌نوشتن `MEDIA_ROOT`
- همه‌ی secretهای `STRAPI_*`؛ مقادیر نمونه فقط برای local هستند و نباید در production استفاده شوند

فایل `.env` حاوی secret است و نباید commit شود.

### ۲. اعتبارسنجی و اجرای stack

```powershell
pnpm check:docker
docker compose up --build -d --wait
docker compose ps --all
```

Compose ابتدا PostgreSQL را healthy می‌کند، سپس migrationهای Prisma را با سرویس یک‌باره‌ی `backend-migrate` اجرا می‌کند و بعد Backend، CMS و Frontend را به ترتیب health checkها بالا می‌آورد. خروجی `docker compose ps --all` باید Backend، CMS، Frontend و PostgreSQL را `healthy` و `backend-migrate` را `Exited (0)` نشان دهد.

آدرس‌ها:

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:3001/api/v1/health`
- Backend readiness: `http://127.0.0.1:3001/api/v1/ready`
- Strapi health: `http://127.0.0.1:1337/_health`
- Strapi admin: `http://127.0.0.1:1337/admin`

پورت‌ها فقط روی loopback منتشر می‌شوند و از شبکه قابل دسترسی عمومی نیستند.

### ۳. لاگ، restart و توقف

```powershell
docker compose logs -f backend cms frontend
docker compose restart
docker compose up -d --wait
docker compose down
```

`docker compose down` containerها را حذف می‌کند ولی volumeهای `postgres-data`، `backend-media` و `strapi-uploads` را حفظ می‌کند. اجرای بعدی `docker compose up -d --wait` همان داده‌ها را برمی‌گرداند.

## اجرای hybrid برای توسعه‌ی کد

در این روش PostgreSQL داخل Docker اجرا می‌شود و dependencyها و سرویس‌های برنامه روی میزبان اجرا می‌شوند.

### ۱. نصب dependencyها و اجرای PostgreSQL

```powershell
pnpm install
docker compose up -d postgres
docker compose ps
```

PostgreSQL به‌صورت پیش‌فرض فقط روی `127.0.0.1:5433` منتشر می‌شود. مقدار پورت از `POSTGRES_PORT` خوانده می‌شود.

### ۲. آماده‌سازی دیتابیس

```powershell
pnpm db:generate
pnpm db:migrate:deploy
```

دستور `db:migrate:deploy` migrationهای موجود را اجرا می‌کند. برای ساخت migration جدید در جریان توسعه از `pnpm db:migrate` استفاده کنید.

### ۳. ساخت ادمین اولیه

این دستور را فقط یک بار، پس از ساخت دیتابیس تازه اجرا کنید:

```powershell
pnpm admin:bootstrap
```

اطلاعات ادمین از `BOOTSTRAP_ADMIN_*` در `.env` خوانده می‌شود. اگر ادمین قبلاً وجود داشته باشد، اجرای مجدد با `ADMIN_ALREADY_EXISTS` متوقف می‌شود.

### ۴. اجرای سرویس‌های برنامه

```powershell
pnpm dev
pnpm start:cms
```

`pnpm dev`، Frontend و Backend را هم‌زمان اجرا می‌کند و `pnpm start:cms` باید در ترمینال جدا اجرا شود:

- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:3001`
- **Backend Health:** `http://localhost:3001/api/v1/health`
- **Strapi CMS:** `http://localhost:1337/admin`

برای اجرای جداگانه هر سرویس:

```powershell
pnpm dev:backend   # اجرای بک‌اند NestJS
pnpm dev:frontend  # اجرای فرانت‌اند Next.js
pnpm start:cms     # اجرای پنل و وب‌سرویس Strapi CMS
```

### ۵. اجرای سرور هوش مصنوعی Strapi MCP (اختیاری)

جهت اتصال دستیارهای هوش مصنوعی و Claude Desktop به سیستم مقالات:

```powershell
pnpm --filter strapi-mcp build
node tools/strapi-mcp/dist/index.js
```

## اجرای روزمره در حالت hybrid

در شروع کار:

```powershell
docker compose up -d postgres
pnpm dev
# در ترمینال جدا
pnpm start:cms
```

اگر migration جدیدی دریافت شده است، پیش از `pnpm dev` این دستور را اجرا کنید:

```powershell
pnpm db:migrate:deploy
```

## حذف کامل داده‌های محلی

هشدار: دستور زیر داده‌های PostgreSQL، فایل‌های Backend و uploadهای Strapi این پروژه را غیرقابل‌بازیابی حذف می‌کند. فقط وقتی backup لازم را گرفته‌اید اجرا کنید.

```powershell
docker compose down --volumes
docker compose up --build -d --wait
```

## بررسی سلامت سرویس‌ها

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/auth/login
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/api/v1/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/api/v1/ready
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:1337/_health
docker compose ps --all
```

endpoint آمادگی Backend اتصال PostgreSQL و storage مدیا را بررسی می‌کند. endpoint سلامت Strapi در حالت سالم پاسخ `204` می‌دهد.

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

### سرویس `backend-migrate` با Exit Code غیرصفر تمام می‌شود

لاگ migration و PostgreSQL را بررسی کنید:

```powershell
docker compose logs backend-migrate postgres
```

Backend تا موفق‌شدن migration شروع نمی‌شود. ابتدا `DATABASE_URL` و مقادیر `POSTGRES_*` را هماهنگ کنید و سپس `docker compose up -d --wait` را دوباره اجرا کنید.

### CMS unhealthy است

```powershell
docker compose logs cms postgres
```

مطمئن شوید `STRAPI_DATABASE_NAME` با `POSTGRES_DB` متفاوت است و secretهای `STRAPI_*` در `.env` مقدار دارند. تغییر نام دیتابیس در `.env` دیتابیس تازه را داخل volume قدیمی خودکار ایجاد نمی‌کند؛ برای داده‌ی موجود migration عملیاتی تعریف کنید یا فقط در محیط disposable از بخش حذف کامل داده‌های محلی استفاده کنید.

## دستورات کنترل کیفیت

پروژه دارای **۴۳۴ آزمون خودکار موفق** در سراسر لایه‌ها است:

```powershell
pnpm lint               # بررسی ESLint
pnpm typecheck          # بررسی خطاهای تایپ TypeScript
pnpm test               # اجرای تست‌های واحد و یکپارچگی (Vitest)
pnpm check:architecture # بررسی مرزبندی لایه‌ها و پکیج‌ها
pnpm check              # اجرای کامل تمام تست‌ها و گیت‌های کیفی
```

