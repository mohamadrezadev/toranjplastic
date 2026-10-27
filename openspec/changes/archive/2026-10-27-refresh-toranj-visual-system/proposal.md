## Why

مالک محصول پالت نفتی و سنگی، فونت فارسی Vazirmatn Variable و پشتیبانی Light/Dark را تأیید کرده است، اما frontend هنوز از پالت سرمه‌ای/نارنجی، Estedad و چند foreground ثابت استفاده می‌کند که در تم تاریک خوانایی قابل اتکا ندارند. این change پایه‌ی بصری سراسری را با جهت تأییدشده هماهنگ می‌کند، بدون آن‌که رفتار محصول، API یا امنیت را تغییر دهد.

## What Changes

- مقادیر registry توکن‌های معنایی Light/Dark به پالت نفتی و سنگی منتقل می‌شوند و foreground مستقل برای action و danger اضافه می‌شود.
- فونت UI فارسی از dependency محلی Estedad به `@fontsource-variable/vazirmatn` مهاجرت می‌کند؛ Poppins فقط برای wordmark لاتین حفظ می‌شود.
- قرارداد فعلی theme شامل `toranj-theme`، ترجیح سیستم، bootstrap پیش از paint و همگام‌سازی `theme-color` حفظ می‌شود و فقط رنگ‌های canvas تغییر می‌کنند.
- shared componentها و styleهای عمومی/auth/customer/admin برای رنگ‌های hard-coded یا استفاده‌ی نادرست از surface به‌عنوان foreground بررسی و به توکن معنایی منتقل می‌شوند.
- تست‌های typography/theme و بررسی‌های responsive، RTL، کنتراست، focus، loading و disabled برای عرض‌های 360، 390، 768 و 1280 به‌روز می‌شوند.
- بازطراحی ساختاری صفحه‌ی اصلی و کاتالوگ در change جداگانه `redesign-public-homepage` باقی می‌ماند و پس از تأیید ترکیب‌بندی UI انجام می‌شود.

## Capabilities

### New Capabilities

- ندارد.

### Modified Capabilities

- `design-system-core`: جهت بصری تأییدشده، Vazirmatn محلی، foregroundهای semantic و محدودیت استفاده از تصاویر واقعی را الزام‌آور می‌کند.
- `theme-preferences`: رنگ canvas مرورگر برای هر تم را به مقادیر جدید متصل می‌کند، در حالی که قرارداد resolution و persistence فعلی بدون تغییر می‌ماند.

## Impact

- Frontend: `frontend/src/design-system/`, root layout، shared CSS modules، shellهای public/auth/customer/admin و تست‌های UI/E2E.
- Dependencies: افزودن `@fontsource-variable/vazirmatn@5.3.0`، حذف Estedad پس از اثبات نبود مصرف و به‌روزرسانی `pnpm-lock.yaml`.
- API، backend، database، authorization، noindex/no-store و مدل‌های داده تغییر نمی‌کنند.
- هیچ cart، checkout، پرداخت، قیمت/موجودی خودکار، ادعای صنعتی یا تصویر محصول/کارخانه‌ی ساختگی اضافه نمی‌شود.
