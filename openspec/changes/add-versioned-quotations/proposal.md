## Why

پس از بررسی استعلام، تیم فروش هنوز نمی‌تواند پیشنهاد قیمت معتبر و قابل‌ردیابی را در همان پنل تهیه و به مشتری تحویل دهد. پیش‌فاکتور نسخه‌بندی‌شده، دستی و مبتنی بر snapshot لازم است تا وضعیت `QUOTED` فقط پس از ارسال یک سند واقعی ایجاد شود.

## What Changes

- افزودن پیش‌فاکتور دستی با شماره یکتا، نسخه، اقلام snapshot، مبلغ به ریال، تخفیف، مالیات، هزینه جانبی، شرایط تحویل، تاریخ اعتبار و توضیحات.
- افزودن capability جدید `QUOTATION_MANAGEMENT` برای ایجاد draft، اصلاح draft و ارسال توسط کارکنان مجاز؛ قیمت از کاتالوگ یا موجودی به‌صورت خودکار محاسبه نمی‌شود.
- قفل‌کردن نسخه ارسال‌شده؛ هر اصلاح پس از ارسال یک نسخه جدید ایجاد و نسخه قبلی را supersede می‌کند.
- تولید PDF خصوصی از snapshot همان نسخه و دانلود فقط از endpoint احراز هویت‌شده، بدون URL عمومی یا cache.
- نمایش نسخه‌های ارسال‌شده و امکان مشاهده/دانلود در پنل مالک استعلام.
- تغییر اتمیک وضعیت استعلام به `QUOTED` فقط هنگام ارسال موفق نسخه معتبر و ثبت history/audit.
- خارج از محدوده: پذیرش/رد مشتری، پرداخت، سبد خرید، موجودی زنده، قیمت عمومی، محاسبه خودکار قیمت و صورتحساب مالیاتی.

## Capabilities

### New Capabilities

- `versioned-inquiry-quotations`: چرخه draft/send/revise، snapshot مالی، PDF خصوصی و gate وضعیت `QUOTED`.

### Modified Capabilities

- `role-authorization`: capability مستقل مدیریت پیش‌فاکتور را برای نقش‌های کارکنان تعریف می‌کند.

## Impact

- Prisma schema و migration برای Quotation، QuotationItem و وضعیت/نسخه سند.
- ماژول backend مستقل Quotations با قرارداد عمومی برای Inquiries و endpointهای `/api/v1/admin/inquiries/:id/quotations` و customer-owned reads.
- تولید PDF سمت سرور و streaming خصوصی با `Cache-Control: no-store`.
- UI ساخت/بازبینی/ارسال در کارتابل ادمین و کارت پیش‌فاکتور در پنل مشتری.
- تست‌های محاسبات integer، concurrency، authorization/ownership، عدم افشای draft و PDF، PostgreSQL integration و responsive E2E.
