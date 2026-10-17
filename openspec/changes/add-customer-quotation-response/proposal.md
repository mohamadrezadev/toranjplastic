## Why

نمایش پیش‌فاکتور بدون پاسخ رسمی مشتری، چرخه تجاری استعلام را نیمه‌کاره می‌گذارد و پذیرش یا رد خارج از سیستم قابل اثبات نیست. مشتری باید بتواند نسخه معتبر و فعلی را در پنل خودش بپذیرد یا رد کند و عملیات بعدی با history معتبر ادامه یابد.

## What Changes

- افزودن پذیرش و رد صریح آخرین نسخه ارسال‌شده و معتبر توسط مالک استعلام، با CSRF، کنترل ownership و ثبت actor/time/version.
- جلوگیری از پاسخ به draft، نسخه superseded/expired یا نسخه‌ای که قبلاً پاسخ داده شده است؛ retry امن نتیجه متعارض را بازنویسی نمی‌کند.
- تبدیل اتمیک `QUOTED -> ACCEPTED` پس از پذیرش مشتری.
- در رد پیشنهاد، فقط همان نسخه quotation به `REJECTED` می‌رود و استعلام به `UNDER_REVIEW` بازمی‌گردد تا تیم فروش بتواند نسخه تازه بسازد؛ رد پیشنهاد با رد نهایی استعلام یکی نیست.
- فعال‌سازی انتقال کارکنان `ACCEPTED -> IN_PROGRESS -> COMPLETED` با history و audit.
- نمایش نتیجه پاسخ، زمان، نسخه و وضعیت ادامه کار در هر دو پنل با UX تأیید صریح و موبایل‌محور.
- خارج از محدوده: امضای حقوقی/دیجیتال، قرارداد، پرداخت، لغو پس از پذیرش، بازگشایی `COMPLETED`، SLA و اعلان بیرونی.

## Capabilities

### New Capabilities

- `customer-quotation-response`: پذیرش/رد امن نسخه معتبر و ادامه چرخه عملیاتی استعلام.

### Modified Capabilities

- `role-authorization`: مرز عمل مشتری و کارکنان در پاسخ پیشنهاد و انتقال‌های پس از پذیرش را تعریف می‌کند.

## Impact

- endpointهای mutation متعلق به مشتری و public service contract ماژول Quotations/Inquiries.
- تراکنش PostgreSQL برای پاسخ quotation، تغییر وضعیت inquiry، status history و audit.
- پنل مشتری برای confirmation و پنل ادمین برای نتیجه و عملیات `IN_PROGRESS/COMPLETED`.
- تست‌های replay/concurrency، ownership، expired/superseded، CSRF، audit و E2E در چهار viewport مصوب.
