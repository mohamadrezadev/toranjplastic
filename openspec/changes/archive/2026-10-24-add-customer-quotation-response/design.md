## Context

بعد از change پیش‌فاکتور، مشتری نسخه‌های ارسال‌شده را می‌بیند اما هنوز پاسخ رسمی ندارد. این تغییر پاسخ را به snapshot و version مشخص متصل می‌کند و سپس وضعیت‌های عملیاتی `ACCEPTED`, `IN_PROGRESS`, `COMPLETED` را با authorization و history معتبر فعال می‌کند.

## Goals / Non-Goals

**Goals:**

- پذیرش یا رد یک‌باره نسخه current، sent و معتبر توسط مالک.
- ثبت غیرقابل‌ابهام actor، زمان و quotation version.
- انتقال اتمیک وضعیت Inquiry و ادامه کنترل‌شده عملیات کارکنان.
- confirmation قابل‌فهم و responsive در پنل مشتری و نمایش نتیجه در ادمین.

**Non-Goals:**

- امضای دیجیتال/حقوقی، قرارداد، پرداخت، لغو پذیرش یا بازگشایی پرونده تکمیل‌شده.
- پذیرش تلفنی توسط کارمند به نمایندگی مشتری.
- SLA، fulfillment جزئی، حمل یا اعلان بیرونی.

## Decisions

1. **Response روی quotation version ذخیره می‌شود، نه فقط Inquiry.** فیلدهای response status، `respondedById`, `respondedAt` و optional bounded rejection reason روی نسخه sent/current ثبت می‌شوند. این مدل اثبات می‌کند مشتری دقیقاً کدام snapshot را دیده است.

2. **فقط owner می‌تواند پاسخ دهد.** `POST /api/v1/inquiries/:inquiryId/quotations/:quotationId/accept|reject` به session/CSRF نیاز دارد و ownership، current status، SENT/current بودن و expiry را داخل transaction دوباره بررسی می‌کند.

3. **Accept و reject semantics متفاوت‌اند.** پذیرش quotation را `ACCEPTED` و Inquiry را `ACCEPTED` می‌کند. رد quotation را `REJECTED` و Inquiry را `UNDER_REVIEW` می‌کند تا revision ممکن باشد؛ `Inquiry.REJECTED` همچنان رد نهایی پرونده توسط عملیات است.

4. **Replay idempotent فقط برای همان نتیجه است.** تکرار accept روی همان نسخه پذیرفته‌شده پاسخ موفق قبلی را برمی‌گرداند؛ accept پس از reject یا reject پس از accept، نسخه غیرcurrent/expired و request متعارض 409 می‌دهند و state را عوض نمی‌کنند.

5. **ادامه عملیات staff-only است.** policy Inquiry فقط `ACCEPTED -> IN_PROGRESS -> COMPLETED` را برای `INQUIRY_OPERATIONS` فعال می‌کند. UI صرفاً `allowedTransitions` backend را نمایش می‌دهد و authorization را بازسازی نمی‌کند.

6. **Confirmation صریح است.** پنل مشتری summary شماره/نسخه/مبلغ/اعتبار را در dialog یا صفحه confirmation نشان می‌دهد؛ accept و reject action جدا، pending و بدون retry خودکار هستند. rejection reason اختیاری و plain text است.

7. **تمام تغییر تجاری یک transaction است.** response، quotation status/version، Inquiry version/status، status history و metadata-only audit با guarded updates commit می‌شوند. هیچ مبلغ یا متن علت در audit/log نوشته نمی‌شود.

## Risks / Trade-offs

- **[کلیک دوباره یا retry شبکه]** → same-result replay idempotent است و result متعارض 409 می‌دهد.
- **[منقضی‌شدن بین render و submit]** → expiry با زمان سرور داخل transaction بررسی و UI پس از 409 refresh می‌شود.
- **[ابهام رد پیشنهاد و رد پرونده]** → status و copy جدا؛ رد quote پرونده را به `UNDER_REVIEW` بازمی‌گرداند.
- **[رقابت پاسخ و revision staff]** → current quotation id و هر دو expected version به‌صورت guarded بررسی می‌شوند.

## Migration Plan

1. migration افزایشی response fields/indexes با null برای داده موجود.
2. deploy backend قبل از frontend؛ quotationهای SENT قدیمی تا پایان اعتبار قابل پاسخ‌اند.
3. rollback اپلیکیشن پاسخ جدید را متوقف می‌کند ولی تاریخچه پذیرفته‌شده را حذف نمی‌کند؛ schema فقط پس از export/backup قابل حذف است.

## Open Questions

- لغو توسط مشتری بعد از acceptance و سیاست reopen نیازمند تصمیم محصول جدا است.
