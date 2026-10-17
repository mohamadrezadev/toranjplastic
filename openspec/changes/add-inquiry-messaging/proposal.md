## Why

کارکنان اکنون فقط می‌توانند درباره استعلام یادداشت داخلی ثبت کنند و مشتری برای پاسخ یا ارائه اطلاعات تکمیلی باید از کانالی خارج از پنل استفاده کند. یک رشته مکالمه امن و قابل‌ردیابی لازم است تا مرحله `NEED_MORE_INFO` واقعاً قابل استفاده شود، بدون آنکه یادداشت داخلی یا اطلاعات سایر مشتریان افشا شود.

## What Changes

- افزودن پیام‌های متنی customer-visible و append-only برای هر استعلام، جدا از یادداشت‌های داخلی.
- امکان ارسال پیام توسط مالک استعلام و کارکنان دارای مجوز `INQUIRY_OPERATIONS` با enforce سمت سرور.
- فعال‌سازی انتقال اتمیک `UNDER_REVIEW -> NEED_MORE_INFO` هنگام درخواست اطلاعات توسط کارمند و `NEED_MORE_INFO -> UNDER_REVIEW` هنگام پاسخ مشتری.
- نمایش رشته مکالمه و فرم پاسخ در جزئیات استعلام پنل مشتری و کارتابل ادمین، با حالت‌های loading/error/empty/disabled و طراحی RTL موبایل‌محور.
- ثبت actor و زمان هر پیام و رویداد وضعیت، همراه `no-store` و جلوگیری از ورود متن پیام به log.
- خارج از محدوده: پیوست، SMS/Email/Push، ویرایش/حذف پیام، چت بلادرنگ، قیمت‌گذاری، پرداخت و موجودی.

## Capabilities

### New Capabilities

- `inquiry-customer-messaging`: قرارداد پیام customer-visible، مالکیت، حریم خصوصی، UI و ارتباط آن با `NEED_MORE_INFO`.

### Modified Capabilities

- `role-authorization`: مجوز ارسال و مشاهده پیام‌های استعلام برای نقش‌ها و capabilityهای کارکنان را صریح می‌کند.

## Impact

- Prisma schema و migration برای پیام‌های استعلام و روابط User/Inquiry.
- APIهای versioned مشتری و ادمین زیر `/api/v1/inquiries` و `/api/v1/admin/inquiries`، سرویس/Repository و audit/status history.
- جزئیات استعلام در `frontend/src/app/account/inquiries/[id]` و `frontend/src/app/admin/inquiries/[id]` و transportهای متناظر.
- تست‌های unit، PostgreSQL integration، API/E2E، privacy/authorization و viewportهای 360، 390، 768 و 1280.
