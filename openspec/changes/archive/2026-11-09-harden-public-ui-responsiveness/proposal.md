## Why

بازبینی واقعی رابط عمومی در viewportهای الزامی نشان داد که failure سرویس محتوا می‌تواند به loading بی‌پایان منجر شود و صفحه اصلی در Hero، breakpoint تبلت، گرید کم‌تعداد، تم تاریک و فوتر موبایل رفتار بصری نامتعادل دارد. این change قراردادهای موجود رابط عمومی را بدون تغییر API یا رفتار تجاری سخت‌سازی می‌کند تا تجربه فارسی RTL در شرایط واقعی داده و خطا قابل‌اعتماد باشد.

## What Changes

- صفحات محتوایی عمومی failureهای شبکه، timeout، پاسخ نامعتبر و 5xx را از loading متمایز می‌کنند و ErrorState قابل‌بازیابی با retry امن نشان می‌دهند.
- Hero صفحه اصلی از متن و CTA رستری مستقل می‌شود؛ عنوان، توضیح و لینک‌های واقعی تنها منبع معنا و تعامل خواهند بود و در موبایل تکرار نمی‌شوند.
- چیدمان کارت‌های صفحه اصلی و گریدهای عمومی به روند یک/دو/سه‌ستونه متناسب با موبایل، تبلت و دسکتاپ تبدیل می‌شود و جهش 768 به 769 حذف می‌شود.
- گرید آخرین مقالات و collectionها برای یک یا دو آیتم بدون track خالی نامتعادل رفتار می‌کند.
- composition مربوط به CTA پایانی، media surfaceهای تم تاریک و گروه‌بندی فوتر موبایل اصلاح می‌شود.
- تست‌های component و Playwright برای loading/error/retry، light/dark، viewportهای 360، 390، 768 و 1280، نقاط مجاور breakpoint و نبود overflow اضافه می‌شوند.
- هیچ قابلیت فروشگاهی، قیمت، موجودی زنده، پرداخت، محاسبه خودکار قیمت، تضمین ظرفیت/زمان تحویل یا ادعای فنی جدیدی اضافه نمی‌شود.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-visual-experience`: Hero معنایی، گرید تطبیقی کم‌تعداد، CTA پایانی، media treatment و پایداری تصاویر عمومی دقیق‌تر می‌شوند.
- `responsive-public-shell`: breakpoint تبلت و گروه‌بندی فوتر موبایل باید در viewportهای الزامی بدون جهش، clipping یا overflow کار کنند.
- `ui-feedback-patterns`: failure درخواست خواندنی عمومی باید loading را خاتمه دهد، ErrorState امن نشان دهد و retry قابل‌آزمون ارائه کند.
- `theme-preferences`: سطوح media، CTAها، لینک‌ها، placeholderها و focus stateهای رابط عمومی باید در هر دو تم سلسله‌مراتب خوانا را حفظ کنند.

## Impact

- **Frontend:** صفحه اصلی، componentهای content/feedback/navigation، CSS Modules، asset یا treatment بنر و تست‌های Vitest/Playwright.
- **API و داده:** قرارداد endpoint، DTO، schema و migration تغییر نمی‌کنند؛ فقط failure پاسخ‌های موجود در UI مدیریت می‌شود.
- **Dependencies:** dependency runtime جدیدی پیش‌بینی نمی‌شود.
- **عملیات:** rollout frontend-only است و rollback با بازگرداندن component/CSS/assetهای این change انجام می‌شود.
