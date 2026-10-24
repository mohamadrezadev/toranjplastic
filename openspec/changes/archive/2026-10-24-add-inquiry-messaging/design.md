## Context

دامنه Inquiry اکنون owner-scoped read، کارتابل کارکنان، optimistic versioning، history وضعیت و یادداشت داخلی دارد. `NEED_MORE_INFO` در enum وجود دارد اما طبق PRD تا ایجاد یک کانال customer-visible نباید تولید شود. این تغییر backend، PostgreSQL و دو صفحه خصوصی Next.js را درگیر می‌کند و باید مرز روشن میان پیام مشتری و یادداشت داخلی را حفظ کند.

## Goals / Non-Goals

**Goals:**

- مکالمه متنی امن و append-only روی یک استعلام.
- enforce مالکیت مشتری و capability کارکنان در backend.
- اتصال تراکنشی پیام‌های درخواست/پاسخ اطلاعات به `NEED_MORE_INFO` و history.
- UI فارسی RTL موبایل‌محور در هر دو پنل و قرارداد DTO صریح.

**Non-Goals:**

- attachment، اعلان بیرونی، realtime/WebSocket، edit/delete و export گفتگو.
- ارسال قیمت یا فایل پیش‌فاکتور در متن پیام.
- تغییر وضعیت terminal، پرداخت، موجودی و قیمت‌گذاری خودکار.

## Decisions

1. **`InquiryMessage` مستقل از `InquiryInternalNote` است.** مدل شامل `id`, `inquiryId`, `authorId`, `senderType`, `text`, `createdAt` است. هیچ flag قابل‌تغییری برای «داخلی/مشتری» وجود ندارد تا یک یادداشت داخلی بر اثر خطای UI منتشر نشود. جایگزین ردشده: یک جدول مشترک با visibility؛ ریسک افشای تصادفی آن بیشتر است.

2. **پیام‌ها immutable و با ترتیب `createdAt ASC, id ASC` هستند.** حذف/ویرایش audit semantics را مبهم می‌کند و در v1 ارزش کافی ندارد. متن plain text پس از trim، بین 1 تا 4000 نویسه است و UI آن را به‌عنوان HTML تفسیر نمی‌کند.

3. **دو command صریح وجود دارد.** مشتری از `POST /api/v1/inquiries/:id/messages` و کارکنان از `POST /api/v1/admin/inquiries/:id/messages` استفاده می‌کنند. endpoint مشتری ownership را در predicate دیتابیس اعمال می‌کند؛ endpoint کارکنان `INQUIRY_OPERATIONS` و CSRF می‌خواهد. metadata نویسنده از session گرفته می‌شود.

4. **تغییر وضعیت فقط با prerequisite پیام و در همان transaction انجام می‌شود.** پیام کارمند می‌تواند با `requestMoreInfo=true` و `expectedVersion`، فقط `UNDER_REVIEW -> NEED_MORE_INFO` را ایجاد کند. اولین پاسخ مشتری در `NEED_MORE_INFO`، پیام و `NEED_MORE_INFO -> UNDER_REVIEW` را atomically ثبت می‌کند و version را افزایش می‌دهد. پیام عادی در وضعیت‌های غیرterminal version را تغییر نمی‌دهد.

5. **DTO مشتری allowlist جدا دارد.** مشتری فقط `senderType`, نام نمایشی ایمن، متن و زمان را می‌بیند؛ role/capability، mobile، audit، notes و assignment هرگز serialize نمی‌شوند. Admin DTO همین رشته customer-visible را جدا از internal notes دریافت می‌کند.

6. **صفحات موجود توسعه می‌یابند.** transport مشتری در `frontend/src/lib/inquiries.ts` و feature ادمین در `frontend/src/features/admin-inquiries` mutationهای CSRF-safe اضافه می‌کنند. composer یادداشت داخلی و composer پیام مشتری با heading، رنگ و متن هشدار متفاوت نمایش داده می‌شوند.

7. **آزمون اتمی با PostgreSQL واقعی انجام می‌شود.** unit policy، API 401/403/404/409، ownership، rollback و responsive E2E پوشش داده می‌شوند. payload پیام در log یا audit metadata ذخیره نمی‌شود.

## Risks / Trade-offs

- **[کاربر دو بار submit می‌کند]** → دکمه pending/disabled است؛ duplicateهای واقعی حفظ می‌شوند چون idempotency key در این برش اضافه نمی‌شود.
- **[رقابت پاسخ مشتری و command ادمین]** → مسیرهای status-changing از expected version و update شرطی استفاده می‌کنند؛ loser با 409 بدون پیام/history ناقص برمی‌گردد.
- **[اشتباه میان note و message]** → مدل، endpoint، action و بخش UI کاملاً مجزا و دارای label صریح هستند.
- **[رشد نامحدود thread]** → جزئیات در v1 یک پنجره محدود از 200 پیام اخیر را به ترتیب زمانی برمی‌گرداند؛ pagination کامل به follow-up اعلان/unread موکول می‌شود.

## Migration Plan

1. backup و اجرای migration افزایشی جدول/ایندکس‌ها؛ inquiry موجود بدون پیام معتبر می‌ماند.
2. deploy backend و سپس frontend؛ تا قبل از frontend endpointها فقط برای client احراز هویت‌شده قابل استفاده‌اند.
3. rollback برنامه: توقف write endpoint، rollback اپلیکیشن و نگهداری جدول افزوده؛ حذف جدول فقط بعد از backup مستقل و تأیید داده انجام می‌شود.

## Open Questions

- اعلان unread و notification provider عمداً به change جدا موکول می‌شود.
