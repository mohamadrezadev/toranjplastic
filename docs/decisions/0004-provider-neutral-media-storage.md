# ADR 0004: ذخیره‌سازی provider-neutral برای رسانه CMS

- **وضعیت:** Proposed
- **تاریخ:** 2026-10-18
- **Change:** `build-media-management`

## زمینه

CMS ترنج پلاستیک به آپلود، پردازش، نگهداری و انتشار تصاویر محصول و مقاله نیاز دارد. محیط استقرار فعلی امکان اتصال Persistent Disk به سرویس Backend در Runflare را دارد، اما محصول نباید به mount path، دامنه یا API اختصاصی یک میزبان وابسته شود. تغییر سرور یا مهاجرت آینده به S3-compatible object storage باید بدون بازنویسی قرارداد CMS، شناسه رسانه، Product/Article data و URL عمومی انجام شود.

## تصمیم

1. `MediaModule` فقط از قرارداد stream-based به نام `MediaStorage` استفاده می‌کند.
2. پیاده‌سازی تولیدی v1، `MountedDiskStorage` روی Persistent Disk ران‌فلر است.
3. PostgreSQL فقط relative object key و metadata قابل‌حمل را ذخیره می‌کند؛ absolute path، provider URL و credential ذخیره نمی‌شوند.
4. public media route و origin متعلق به ترنج و مستقل از provider باقی می‌مانند.
5. ساختار object key بین adapterها ثابت است و export manifest شامل key، size و checksum خواهد بود.
6. v1 فقط یک media writer دارد؛ چند writer بدون اثبات semantics دیسک مشترک فعال نمی‌شود.
7. mount ناموجود یا نامعتبر باعث readiness failure می‌شود و fallback به ephemeral disk ممنوع است.
8. S3 adapter فقط در یک change جدا و پس از انتخاب سرویس واقعی، قرارداد، backup و credential پیاده می‌شود.

## پیامدها

- استقرار اولیه ساده و سازگار با زیرساخت فعلی است.
- public delivery در v1 از Backend عبور می‌کند و هزینه bandwidth/CPU دارد.
- جابه‌جایی آینده نیازمند copy و checksum verification فایل‌هاست، اما شناسه‌ها، URLها و قراردادهای محتوایی تغییر نمی‌کنند.
- DB و filesystem تراکنش مشترک ندارند؛ state machine، cleanup و reconciliation الزامی است.
- بکاپ معتبر باید PostgreSQL و Media Storage را در یک recovery point قابل‌شناسایی پوشش دهد.

## گزینه‌های ردشده

- **ذخیره در `frontend/public` یا filesystem deploy:** durable نیست و runtime data را به build گره می‌زند.
- **ذخیره absolute path یا Runflare URL در DB:** مهاجرت را به بازنویسی داده تبدیل می‌کند.
- **MinIO روی همان سرور:** پیچیدگی عملیاتی اضافه می‌کند ولی وابستگی به compute را حذف نمی‌کند.
- **S3 adapter بدون provider واقعی:** قرارداد و رفتار تأییدنشده وارد production design می‌کند.

## شرط پذیرش

این ADR زمانی Accepted می‌شود که OpenSpec change بازبینی شود و preflight ران‌فلر مسیر mount، دسترسی، ظرفیت، replica، backup/restore و HTTPS origin را با شواهد staging تأیید کند.
