# ترنج پلاستیک (Toranj Plastic)

سامانه جامع و یکپارچه B2B ترنج پلاستیک — خدمات تزریق پلاستیک کارمزدی (۸۰ تا ۴۵۰ تن)، قطعات اختصاصی صنعتی و تأمین مواد اولیه پلیمری.

این پروژه یک **Monorepo مشخصات‌محور (Spec-driven)** با پشتیبانی کامل از زبان فارسی و چینش راست‌به‌چپ (RTL) است.

---

## ۱. ساختار Monorepo

```text
├── frontend/             Next.js 16 (App Router) — پورت ۳۰۰۰ (پورتال عمومی، کاتالوگ، پنل مشتری و پنل مدیریت)
├── backend/              NestJS Modular Monolith & Prisma — پورت ۳۰۰۱ (منطق تجاری، استعلام‌ها، پیش‌فاکتور، پیامک و مدیا)
├── cms/                  Strapi v5 Headless CMS — پورت ۱۳۳۷ (دانشنامه تخصصی، مقالات سئو و وبلاگ)
├── tools/strapi-mcp/     سرور رسمی Model Context Protocol (MCP) جهت اتصال ایجنت‌های هوش مصنوعی به Strapi
├── openspec/             مرجع رسمی نیازمندی‌ها (Source of Truth) و مستندات تغییرات OpenSpec
├── docs/                 معماری کلان، تصمیمات مهندسی (ADRs) و راهنماهای عملیاتی (Runbooks)
└── compose.yaml          پیکربندی کانتینرهای داکر (PostgreSQL 17، Backend، CMS و Frontend)
```

---

## ۲. قابلیت‌های کلیدی سیستم

* **سایت بازاریابی و کاتالوگ صنعتی B2B:**
  - فرم استعلام سریع (Fast-Track) و فرم‌های تفصیلی چندمرحله‌ای متصل به دیتابیس.
  - معرفی دقیق ناوگان تزریق کارخانه کهریزک (۸۰ تا ۴۵۰ تن، قطعات ۵ تا ۱۵۰۰ گرم) و شرایط قالب‌های مشتری.
  - کاتالوگ محصولات و گریدهای پلیمری به همراه اسناد فنی و متاتگ‌های سئو Schema.org JSON-LD.
* **پنل کاربری مشتریان (`/account`):**
  - پیگیری گام‌به‌گام وضعیت استعلام‌ها، گفتگوی مستقیم با کارشناسان و دانلود پیش‌فاکتور رسمی PDF.
* **پنل مدیریت سازمانی (`/admin`):**
  - کنترل دسترسی چندسطحی (Admin، Sales، Operator).
  - مدیریت استعلام‌ها، یادداشت‌های محرمانه داخلی (`InternalNote`) و صدور پیش‌فاکتورهای رسمی با محاسبه ارزش افزوده.
  - مدیریت پرسنل (`/admin/staff`)، کاتالوگ محصولات و کتابخانه چندرسانه‌ای (`MediaAsset`).
* **تحریریه هوشمند و وبلاگ (Strapi v5 + ISR):**
  - مدیریت مقالات با بازتولید آنی کش صفحات عمومی (On-Demand ISR Revalidation).
  - ساخت خودکار سوپرادمین اولیه (`admin@toranjplastic.com`) و دسترسی مستقیم از پنل ادمین وب‌سایت.
* **سیستم نوتیفیکیشن پیامکی تراکنشی (Transactional SMS):**
  - ارسال پیامک در ۳ رویداد: ثبت استعلام مشتری (به مدیر)، صدور پیش‌فاکتور رسمی (به مشتری) و پیام جدید گفتگو.
  - معماری مستقل از درگاه (کاوه‌نگار، ملی‌پیامک و...)، ارسال غیرمسدودکننده (Non-blocking) و نرمال‌سازی شماره‌های ایران.
* **سرور هوش مصنوعی Strapi MCP (`tools/strapi-mcp`):**
  - فراهم‌کننده ابزارهای استاندارد MCP برای اتصال به LLMها و ایجنت‌های خودکار جهت تولید، سئو و انتشار مقالات.

---

## ۳. شروع به کار در محیط محلی (Local Development)

### پیش‌نیازها
- Node.js نسخه `24.11` یا بالاتر
- pnpm نسخه `9.15` یا بالاتر
- Docker Desktop و Docker Compose

### راه‌اندازی کامل با Docker Compose

```powershell
# ۱. فقط در اولین اجرا
Copy-Item .env.example .env

# ۲. secretها و مقادیر محلی .env را تنظیم کنید، سپس config را بررسی کنید
pnpm check:docker

# ۳. ساخت imageها، اجرای migration و بالا آوردن کل stack
docker compose up --build -d --wait

# ۴. مشاهده وضعیت؛ backend-migrate باید با Exit Code صفر تمام شده باشد
docker compose ps --all
```

این مسیر PostgreSQL، Backend، Strapi CMS و Frontend را اجرا می‌کند. دیتابیس Backend و CMS در یک PostgreSQL ولی با نام‌های جدا (`POSTGRES_DB` و `STRAPI_DATABASE_NAME`) ساخته می‌شوند. برای توسعه‌ی hybrid با Node.js روی میزبان، [runbook توسعه محلی](docs/local-development-runbook.md) را ببینید.

### پورت‌ها و آدرس‌های دسترسی محلی:
- **وب‌سایت و پرتال فرانت‌اند:** `http://localhost:3000`
- **وب‌سرویس بک‌اند:** `http://localhost:3001/api/v1/health`
- **آمادگی بک‌اند و وابستگی‌ها:** `http://localhost:3001/api/v1/ready`
- **پنل مدیریت محتوای Strapi:** `http://localhost:1337/admin`

برای مشاهده‌ی لاگ‌ها و توقف بدون حذف داده‌ها:

```powershell
docker compose logs -f
docker compose down
```

---

## ۴. کنترل کیفیت و آزمون‌های خودکار

پروژه دارای **۴۳۴ آزمون خودکار موفق** در سراسر لایه‌ها است:

```bash
pnpm lint               # بررسی استانداردهای کد و ESLint
pnpm typecheck          # بررسی دقیق تایپ‌های TypeScript در تمام پکیج‌ها
pnpm test               # اجرای ۴۳۴ تست واحد و یکپارچگی (Vitest)
pnpm check:architecture # بررسی عدم شکستن مرزهای لایه‌ای معماری
pnpm check              # اجرای کامل تمام گیت‌های کیفی
```

---

## ۵. راهنماها و مستندات تکمیلی (Runbooks)

- [راهنمای جامع توسعه محلی (Local Development Runbook)](docs/local-development-runbook.md)
- [راهنمای استقرار روی ران‌فلر (Runflare Deployment Guide)](docs/runbooks/runflare-deployment.md)
- [راهنمای مدیریت و پشتیبان‌گیری Strapi (Strapi Operations Runbook)](docs/runbooks/strapi-operations.md)
- [راهنمای ابزار سرور هوش مصنوعی Strapi MCP](tools/strapi-mcp/README.md)
- [قرارداد ایجنت‌ها و اصول معماری پروژه](AGENTS.md)
