# راهنمای یکپارچه‌سازی Astryx در فرانت‌اند ترنج پلاستیک

این سند مرجع رسمی نگهداری، توسعه و ارتقای رابط کاربری مبتنی بر Astryx در `frontend/` است (خروجی تغییر OpenSpec: `rebuild-ui-with-astryx`).

## ۱. نگاشت تم ترنج (Theme Mapping)

* **توکن‌های پایه ترنج:** در [tokens.css](file:///c:/project/toranjplastic/frontend/src/design-system/tokens.css) تعریف شده‌اند (پالت petroleum-and-stone، فونت `Vazirmatn`، فاصله‌ها، شعاع‌ها و حالت‌های روشن/تاریک).
* **نگاشت روی Astryx:** در [astryx-theme.css](file:///c:/project/toranjplastic/frontend/src/design-system/astryx-theme.css) متغیرهای `[data-astryx-theme="neutral"]` به توکن‌های ترنج نگاشت شده‌اند تا هویت بصری و کنتراست مصوب در هر دو تم حفظ شود.
* **ترتیب لایه‌های CSS:** در [globals.css](file:///c:/project/toranjplastic/frontend/src/app/globals.css) ترتیب لایه‌ها و `@import`ها (`reset.css`، `astryx.css`، `@astryxdesign/theme-neutral/theme.css`، `legacy-compat.css`، `tokens.css` و `astryx-theme.css`) کنترل می‌شود.
* **مرز Provider کلاینت:** [AstryxProvider.tsx](file:///c:/project/toranjplastic/frontend/src/components/providers/AstryxProvider.tsx) فقط اتصال `Theme`، لینک‌های Next.js، ترجمه‌های فارسی (`astryxPersianOverrides`) و همگام‌سازی تم روشن/تاریک با `themeBootstrapScript` را بر عهده دارد.

## ۲. نقاط ورود عمومی کامپوننت‌ها (Public Entry Points)

* **پکیج Astryx:** فقط از exportهای عمومی پکیج مانند `@astryxdesign/core/Button`، `@astryxdesign/core/Card`، `@astryxdesign/core/Table` و `@astryxdesign/theme-neutral/theme.css` استفاده کنید.
* **آداپتورهای لایه UI ترنج:**
  * `@/components/ui`: `Button`، `Input`، `Textarea`، `Select`، `Checkbox`، `Radio`، `Switch`، `StatusBadge`
  * `@/components/feedback`: `Alert`، `EmptyState`
  * `@/components/admin/AdminContent`: `AdminPage`، `AdminListPage`، `AdminHeader`، `AdminSection`، `AdminForm`، `AdminFormRow`، `AdminFormAlert`، `AdminPagination`، `AdminTimeline`، `AdminStat`
* **ممنوعیت‌های معماری (تحت کنترل `pnpm check:architecture`):**
  * وارد کردن فایل‌های داخلی/سورس/dist یا `runtime-theme` از Astryx ممنوع است.
  * وارد کردن مستقیم `@stylexjs/stylex` یا نوشتن سلکتورهای کلاس تولیدشده ممنوع است.
  * منطق محصول یا دسترسی نباید داخل آداپتورهای `@/components/ui` قرار بگیرد.

## ۳. روند کاری مصوب (Approved Workflow)

در این مخزن، CLI قفل‌شده Astryx فقط از طریق اسکریپت ریشه اجرا می‌شود:

```powershell
pnpm astryx search "<query>"
pnpm astryx component <Name>
pnpm astryx build "<idea>"
pnpm astryx template <Name> <path>
pnpm astryx docs <topic>
pnpm astryx doctor
```

* فایل‌های `AGENTS.md` و `openspec/` همواره اولویت بالاتری نسبت به راهنمای عمومی Astryx دارند (قوانین RTL، غیرفروشگاهی بودن نسخه ۱، عدم نمایش قیمت/موجودی/ادعای تأییدنشده و کنترل دسترسی سمت سرور).

## ۴. فرآیند استثنای Swizzle

* در حالت عادی از کپی‌کردن کد داخلی کامپوننت‌های Astryx (swizzle) خودداری کنید و از composition و propهای عمومی استفاده کنید.
* اگر نیاز واقعی و مستندی به تغییر رفتار داخلی یک کامپوننت وجود داشت، ابتدا دلیل فنی، جایگزین‌های بررسی‌شده و اثر آن بر ارتقا باید در یک ADR در `docs/decisions/` ثبت و تأیید شود.

## ۵. روش دقیق ارتقای پکیج‌های Astryx

هر سه پکیج `@astryxdesign/core`، `@astryxdesign/theme-neutral` و `@astryxdesign/cli` در [frontend/package.json](file:///c:/project/toranjplastic/frontend/package.json) باید همیشه **دقیقاً هم‌نسخه** باشند:

1. تغییر نسخه هر سه پکیج به نسخه هدف یکسان در `frontend/package.json` و اجرای `pnpm install`.
2. اجرای راهنمای ارتقای CLI:
   ```powershell
   pnpm astryx upgrade --from <old-version> --apply
   ```
3. بررسی هم‌راستایی نسخه‌ها و سلامت پیکربندی:
   ```powershell
   pnpm check:astryx
   pnpm astryx doctor
   ```
4. اجرای گیت‌های کامل کیفی و بیلد:
   ```powershell
   pnpm check:architecture
   pnpm --filter frontend typecheck
   pnpm --filter frontend lint
   pnpm --filter frontend test
   pnpm --filter frontend build
   ```
