## Context

Frontend یک Next.js فارسی و RTL است که registry سراسری توکن‌ها، theme bootstrap پیش از hydration و کنترل فعلی `ThemeToggle` را دارد. بررسی repo نشان می‌دهد root layout هنوز Estedad را import می‌کند، canvasهای مرورگر با رنگ‌های v2 همگام‌اند، چند primary/danger foreground از `surface-card` یا hex روشن استفاده می‌کنند و styleهای public/auth/customer/admin از ترکیب رنگ‌های ثابت قدیمی استفاده می‌کنند. بسته‌ی Design System v3 مورخ 2026-10-20 با checksum معتبر، پالت نفتی/سنگی و Vazirmatn را به‌عنوان تصمیم مالک محصول تحویل داده است.

## Goals / Non-Goals

**Goals:**

- تثبیت یک semantic API سراسری برای Light/Dark با foreground مستقل action و danger.
- بارگیری self-hosted فونت Vazirmatn Variable و حفظ fallback و Poppins wordmark.
- حفظ کامل resolution، persistence، pre-paint application و accessibility قرارداد تم فعلی.
- مهاجرت کنترل‌شده‌ی shared styles و اثبات عدم regression در public، auth، account، inquiry و admin.
- حفظ RTL و usability در عرض‌های 360، 390، 768 و 1280.

**Non-Goals:**

- تغییر backend، API، database، authorization، noindex/no-store یا semantics استعلام.
- افزودن فروش، سبد، پرداخت، قیمت/موجودی خودکار یا ادعای فنی تأییدنشده.
- تغییر فایل رسمی لوگو یا تولید تصویر ساختگی محصول، کارخانه، ماشین یا خدمت.
- بازطراحی composition صفحه‌ی اصلی و کاتالوگ؛ این کار در `redesign-public-homepage` و پس از review بصری انجام می‌شود.

## Decisions

1. **حفظ نام tokenهای فعلی و تغییر معنای کنترل‌شده‌ی مقادیر.** مصرف‌کننده‌های موجود بدون تغییر API کار می‌کنند. `--color-on-action` و `--color-on-danger` اضافه می‌شوند تا surface token دیگر نقش foreground را بازی نکند. جایگزینی سراسری hex انجام نمی‌شود؛ هر مصرف بر اساس معنا بررسی می‌شود.
2. **حفظ engine تم موجود.** `themeStorageKey` برابر `toranj-theme`، رفتار `prefers-color-scheme`، bootstrap script و `ThemeToggle` بازنویسی نمی‌شوند. فقط `themeColors` با canvasهای `#f3f1ec` و `#0f1a1c` همگام می‌شود. افزودن provider یا کتابخانه‌ی theme ارزش معماری ندارد و ریسک flash را بالا می‌برد.
3. **فونت محلی versioned.** `@fontsource-variable/vazirmatn@5.3.0` به frontend اضافه و از root layout import می‌شود. پس از جست‌وجو و تست نبود مصرف، dependency Estedad حذف می‌شود. CDN خارجی رد می‌شود تا rendering به شبکه‌ی بیرونی وابسته نباشد.
4. **مهاجرت به ترتیب blast radius.** ابتدا tokens/font/theme و تست‌های آن‌ها، سپس Button/Navigation/Content/Auth و در پایان audit سطوح account/admin انجام می‌شود. چون tokens global هستند، تغییر فقط با تست public کافی نیست.
5. **اصالت دارایی.** این change فقط قرارداد استفاده از `/catalog/*.webp` و رسانه‌های CMS تأییدشده را حفظ می‌کند. اگر تصویر معتبر خدمت/کارخانه وجود نداشته باشد، fallback متنی استفاده می‌شود.
6. **مرز امنیت و داده بدون تغییر.** هیچ endpoint، DTO، session، role یا cache policy تغییر نمی‌کند. verify شامل smoke test صفحات خصوصی برای حفظ noindex/no-store و boundaryهای فعلی است.

## Risks / Trade-offs

- [تغییر global token می‌تواند خوانایی admin/account را خراب کند] → screenshot و interaction smoke در هر دو تم و audit foregroundهای hard-coded پیش از تکمیل task.
- [action روشن در Dark با متن روشن کنتراست ضعیف دارد] → استفاده‌ی اجباری از `--color-on-action` تیره و بررسی حالت hover/focus/disabled.
- [تعویض فونت می‌تواند wrapping و overflow را تغییر دهد] → تست computed font و چهار breakpoint، همراه با fallback قابل‌استفاده.
- [حذف مکانیکی تمام رنگ‌های ثابت می‌تواند status یا asset برند را تخریب کند] → فقط UI colorهای دارای معنای روشن migrate می‌شوند؛ تصاویر و لوگو دست‌نخورده می‌مانند.
- [baseline تصویری نیازمند سرویس‌های قابل اجرا و داده است] → پیش‌نیازهای Playwright ثبت می‌شوند و هر مورد اجرا‌نشده صریحاً باز می‌ماند؛ نتیجه‌ی سبز جعل نمی‌شود.

## Migration Plan

1. baseline و مصرف‌های فعلی typography/theme/color ثبت شود.
2. dependency فونت، lockfile، root import، tokens و browser theme colors تغییر کنند و تست‌های مستقیم به‌روز شوند.
3. foregroundهای Button/Navigation/Content و رنگ‌های UI در Auth و shellها به semantic token منتقل شوند.
4. lint، typecheck، unit، architecture و build اجرا شوند؛ سپس Playwright و بررسی تصویری دو تم در چهار breakpoint انجام شود.
5. rollout بدون migration دیتابیس و به‌صورت commitهای جدا برای foundation و shared surfaces انجام شود. rollback با revert همان commitها و lockfile است.
6. تنها پس از verify و پذیرش، change archive شود؛ composition صفحات در change جداگانه ادامه می‌یابد.

## Open Questions

- layout نهایی Hero و cardهای کاتالوگ هنوز نیازمند review مالک UI است و در این change تصمیم‌گیری نمی‌شود.
- تصویر تأییدشده‌ای برای کارخانه و فرایند تزریق در دارایی‌های فعلی شناسایی نشده است؛ تا زمان انتشار در CMS از تصویر جایگزین استفاده نمی‌شود.
