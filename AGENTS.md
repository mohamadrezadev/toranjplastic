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

<!-- ASTRYX:START -->
Astryx v0.7.13 · 174 components
CLI: run every command as `pnpm dlx @astryxdesign/cli@0.7.13 <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then tokens (var(--color-*|--spacing-*|--radius-*)). No raw hex/px. No StyleX/Tailwind compiler here — don't use xstyle/utility classes directly. Some templates use StyleX and need a compiler plugin; see `astryx docs styling-overview`.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or a token.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->

## Toranj Astryx application rules

- In this repository, use the locked local CLI through `pnpm astryx`; do not replace it with an unpinned `pnpm dlx` invocation.
- Astryx templates are discovery references for the existing OpenSpec-governed screens. They do not override the PRD, the active change, server-component boundaries, security rules, Persian copy, or existing product data.
- During incremental migration, existing semantic HTML and CSS modules may remain until their owning screen is migrated and verified. New Astryx-facing code uses public exports and published CSS only.
- The generated Astryx block is subordinate to the Source of truth and engineering boundaries above wherever wording conflicts.
