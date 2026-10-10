# ADR 0002 — مرز خواندن محتوای عمومی

- وضعیت: پذیرفته‌شده
- تاریخ: ۱۰ اکتبر ۲۰۲۶

## زمینه

فاز دوم به CMS و صفحات عمومی نیاز دارد، اما عملیات نوشتن CMS بدون هویت و مجوز ادمین سمت سرور مجاز نیست. احراز هویت کامل نیز در فاز بعدی Roadmap قرار دارد. هم‌زمان رابط عمومی نباید draft، archive یا داده تجاری تأییدنشده را نمایش دهد.

## تصمیم

ماژول `content` در modular monolith مالک lifecycle و قرارداد محتوای عمومی است. در برش نخست فقط API خواندن عمومی فعال می‌شود و repository تنها محتوای دارای وضعیت `PUBLISHED` و `publishedAt` معتبر را برمی‌گرداند. endpoint نوشتن، preview و upload تا زمان تکمیل احراز هویت و مجوز سمت سرور ساخته نمی‌شود.

مدل‌های Category، Product، InjectionService، Material، Article و ManagedPage مستقل باقی می‌مانند. controller به service و service به port با نام `PublicContentRepository` وابسته است؛ Prisma adapter جزئیات persistence را در لایه infrastructure نگه می‌دارد.

## پیامدها

- صفحات عمومی بعدی قرارداد versioned و امن برای SSR دارند.
- نبود محتوای منتشرشده با collection خالی نمایش داده می‌شود و با seed ساختگی پر نمی‌شود.
- CMS write نیازمند Change مستقل پس از حداقل هویت امن ادمین است.
- media provider، redirect و sitemap هنوز تصمیم‌های بعدی هستند.
- schema از ابتدا برای lifecycle آماده است، اما هیچ قیمت، موجودی، ظرفیت، زمان تحویل یا گواهی تأییدنشده ذخیره/منتشر نمی‌کند.
