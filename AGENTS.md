# Toranj Plastic — Agent Contract

این فایل قرارداد اجرایی همه انسان‌ها و ایجنت‌هایی است که در این monorepo تغییر ایجاد می‌کنند.

## Source of truth

اولویت تعارض اسناد به این ترتیب است:

1. PRD v1.2 موجود در بسته handoff با checksumهای `MANIFEST.json` همان بسته
2. specهای جاری `openspec/specs/` و change فعال در `openspec/changes/`
3. ADRهای `docs/decisions/`
4. Design System v2؛ تا زمان تأیید هویت بصری «پیشنهادی» است
5. کد موجود

هیچ ایجنتی حق ندارد ابهام محصول را با داده ساختگی حل کند. ابهام باید در artifact مرتبط OpenSpec ثبت شود.

## Spec-driven workflow

ساختار و lifecycle فقط OpenSpec رسمی است و نباید قالب موازی ساخته شود:

1. Explore: بررسی بدون تغییر کد.
2. Propose: اجرای `openspec new change <name>` و ساخت artifactها طبق `openspec instructions`.
3. Review: بازبینی `proposal.md`، delta specها، `design.md` و `tasks.md` پیش از اجرا.
4. Apply: اجرای taskها و علامت‌زدن checkbox هر خروجی اثبات‌شده.
5. Archive: پس از verify، اجرای `openspec archive` تا deltaها در `openspec/specs/` ادغام شوند.

مسیر رسمی change برابر `openspec/changes/<change-name>/` است و artifactها باید از schema فعال در `openspec/config.yaml` پیروی کنند.

اصلاح typo، formatting و تغییر صرفاً مستندی می‌تواند spec مستقل نداشته باشد، اما نباید قرارداد محصول را تغییر دهد.

## Non-negotiable product rules

- v1 فروشگاه نیست: سبد خرید، پرداخت آنلاین، موجودی زنده و محاسبه خودکار قیمت ممنوع است.
- قیمت، ظرفیت، موجودی، زمان تحویل، گواهی یا توان فنی فقط با منبع و تأیید معتبر نمایش داده می‌شود.
- فارسی، RTL و Mobile-First پیش‌فرض است؛ عرض‌های 360، 390، 768 و 1280 باید پوشش داده شوند.
- `Customer` نقش پیش‌فرض است؛ مجوزهای Admin/Sales/Operator فقط سمت سرور enforce می‌شوند.
- مالکیت درخواست و فایل سمت سرور کنترل می‌شود؛ `InternalNote` هرگز وارد DTO/response مشتری نمی‌شود.
- صفحات خصوصی `noindex` و `no-store` هستند؛ داده حساب، پیشنهاد، فایل خصوصی و token وارد cache عمومی یا log نمی‌شود.
- وضعیت درخواست فقط یکی از مقادیر مصوب PRD 04 است و هر تغییر status در history ثبت می‌شود.
- secret، OTP، password، token و داده شخصی در Git یا log ممنوع است.

## Engineering boundaries

- `frontend/`: Next.js؛ presentation و orchestration UI، بدون دسترسی مستقیم به دیتابیس.
- منطق CMS مدیر در `frontend/src/features/admin-content/<resource>/` مالکیت می‌شود؛ routeها فقط routing/metadata/composition و مصرف `index.ts` عمومی هر feature را انجام می‌دهند. `shared/` فقط transport و contract بی‌طرف است.
- featureها نباید deep import یا cycle بسازند و frontend نباید backend source را import کند؛ `pnpm check:architecture` این مرزها را در CI بررسی می‌کند.
- آزمون atomicity مدیریت محتوا باید با PostgreSQL واقعی و دیتابیس disposable با نام شامل `test` اجرا شود؛ دستور `pnpm test:integration:postgres` بدون `DATABASE_URL` ایمن fail می‌کند.
- `backend/`: NestJS modular monolith؛ مالک business rules، authorization، persistence و audit.
- PostgreSQL فقط از backend قابل دسترسی است؛ Prisma schema و migration در کنترل نسخه می‌مانند.
- ماژول‌های backend نباید repository داخلی یکدیگر را مستقیم import کنند؛ تعامل از public service/contract انجام شود.
- API زیر `/api/v1` نسخه‌بندی می‌شود. قرارداد endpoint باید قبل از implementation در spec ثبت شود.
- componentهای UI به چهار لایه tokens، primitives، domain components و screens تقسیم می‌شوند.
- `any`، bypass کردن validation، خاموش کردن lint و assertion مجوز در UI قابل قبول نیست.

## Definition of done

- معیارهای پذیرش spec قابل ردیابی و پاس‌شده‌اند.
- lint، typecheck، unit/integration test و build سبز است.
- مسیرهای امنیتی failure test دارند و log حاوی داده حساس نیست.
- UI حالت loading/empty/error/disabled/focus و RTL را پوشش می‌دهد.
- env جدید در `.env.example` و تصمیم معماری مهم در ADR ثبت شده است.
- تغییر schema همراه migration و برنامه rollback/backup است.
