# PRD نهایی مدیریت رسانه CMS ترنج پلاستیک

> **شناسه:** TORANJ-PRD-CMS-MEDIA-002
> **نسخه:** 1.0 — Approved for OpenSpec planning
> **تاریخ:** 2026-10-18 / ۱۴۰۵-۰۷-۲۶
> **محصول:** Toranj Plastic — کاتالوگ شرکتی و استعلام B2B
> **OpenSpec change:** `build-media-management`
> **مبنای کد:** `e71a71da8776486c1b5a872b3c051b9b34bf226a`

## 1. تصمیم نهایی

ترنج پلاستیک یک قابلیت مشترک مدیریت رسانه برای محصولات و مقالات ایجاد می‌کند. قابلیت محصول، API و مدل داده به ارائه‌دهنده ذخیره‌سازی وابسته نخواهند بود. نسخه اول از Persistent Disk متصل به Backend در Runflare استفاده می‌کند، اما فقط از طریق قرارداد `MediaStorage`؛ مهاجرت بعدی به S3-compatible object storage یا سرور دیگر نباید قرارداد CMS، شناسه رسانه، URL عمومی یا داده محتوایی را تغییر دهد.

این سند، PRD مدیریت رسانه و سند پیشنهادی Runflare را تلفیق می‌کند. قرارداد اجرایی نهایی در artifactهای OpenSpec change ثبت می‌شود و نباید دو change موازی یا دو منبع حقیقت برای این قابلیت ایجاد شود.

## 2. مسئله و هدف

CMS فعلی برای محصول حداکثر شش جفت URL/alt و برای مقاله یک URL تصویر شاخص دریافت می‌کند. تصاویر مدیریت‌شده، آپلود امن، پردازش، کتابخانه رسانه، کنترل ارجاع، پیش‌نمایش خصوصی و ذخیره‌سازی مستقل از deploy وجود ندارند.

هدف این change آن است که Admin و Operator بتوانند بدون Git:

- تصویر JPEG، PNG یا WebP را امن آپلود کنند؛
- رسانه آماده را از کتابخانه انتخاب و دوباره استفاده کنند؛
- گالری محصول را تا شش تصویر مرتب کنند و تصویر اول را به‌عنوان cover تعیین کنند؛
- تصویر شاخص مقاله را انتخاب، جایگزین یا واقعاً پاک کنند؛
- محتوای Draft را خصوصی نگه دارند و فقط رسانه متصل به محتوای Published را عمومی کنند؛
- در آینده Storage یا سرور را بدون بازنویسی CMS عوض کنند.

## 3. خارج از دامنه

- فروشگاه، سبد خرید، پرداخت آنلاین، قیمت‌گذاری، موجودی زنده یا محاسبه زمان تحویل.
- آپلود مشتری، پیوست استعلام، قرارداد یا فایل خصوصی مشتری.
- ویدئو، صوت، PDF، SVG، GIF متحرک، OCR یا تولید تصویر با AI.
- Rich Text Editor و اتصال `ARTICLE_INLINE`؛ Media Picker برای change آینده قابل استفاده خواهد بود.
- import خودکار از URL خارجی یا دانلود سروری URL واردشده توسط کاربر.
- مهاجرت اجباری تمام تصاویر `/catalog/*` و URLهای تاریخی در انتشار اول.
- پیاده‌سازی S3 adapter بدون سرویس واقعی و تأییدشده.

## 4. نقش‌ها و مجوزها

| نقش | آپلود/کتابخانه/ویرایش/حذف | مشاهده رسانه عمومی |
|---|---:|---:|
| `ADMIN` | بله | بله |
| `OPERATOR` | بله، با `CONTENT_MANAGEMENT` | بله |
| `SALES` | خیر | بله |
| `CUSTOMER` / Anonymous | خیر | فقط رسانه محتوای Published |

- تمام عملیات مدیریتی با session معتبر، حساب فعال، capability سمت سرور و CSRF برای mutation محافظت می‌شوند.
- پنهان‌بودن UI مجوز محسوب نمی‌شود.
- پاسخ Admin و preview خصوصی `Cache-Control: no-store` و صفحات خصوصی `noindex` هستند.
- public media endpoint برای رسانه بدون حداقل یک reference فعال به محتوای قابل‌نمایش `404` می‌دهد.

## 5. معماری قابل‌مهاجرت

```text
Next.js Admin/Public
        |
        v
NestJS MediaModule
  |-- MediaService / ImageProcessor
  |-- MediaStorage contract
  |     |-- MountedDiskStorage (v1 / Runflare)
  |     `-- S3StorageAdapter (future change)
  |-- MediaAsset + MediaReference (PostgreSQL)
  `-- private preview + stable public delivery
```

قواعد غیرقابل‌مذاکره:

1. فقط Backend به Storage دسترسی دارد.
2. مسیر مطلق مانند `/app/media/...` یا URL وابسته به provider در DB ذخیره نمی‌شود.
3. DB فقط relative storage key مانند `objects/ab/<asset-id>/detail.webp` را نگه می‌دارد.
4. URL عمومی از دامنه متعلق به ترنج و شناسه رسانه ساخته می‌شود، نه از دامنه داخلی Runflare.
5. route عمومی پایدار است: `/api/v1/media/public/:id/:variant`؛ پیاده‌سازی آینده می‌تواند پس از کنترل eligibility به CDN یا object storage redirect کند.
6. Storage adapter باید stream-based باشد و فایل کامل را بی‌دلیل در RAM نگه ندارد.
7. v1 یک Writer دارد. چند Replica/Writer تا اثبات semantics دیسک مشترک فعال نمی‌شود.
8. Mount ناموجود یا غیرقابل‌نوشتن باعث readiness failure می‌شود و fallback به ephemeral disk ممنوع است.

## 6. ذخیره‌سازی و پردازش

### 6.1 ورودی و خروجی

| ویژگی | مقدار MVP |
|---|---|
| ورودی | JPEG، PNG، WebP با magic-byte و decode واقعی |
| حداکثر حجم | 8 MiB، قابل تنظیم در Backend و reverse proxy |
| حداکثر پیکسل | 20 مگاپیکسل، قابل تنظیم |
| حداقل ابعاد | 64×64 |
| خروجی | WebP در عرض‌های حداکثر 320، 800 و 1600 |
| تعداد تصویر محصول | حداکثر 6 |
| پردازش هم‌زمان | حداکثر 2، قابل تنظیم |

- EXIF و metadata مکانی حذف، جهت تصویر اصلاح و بزرگ‌نمایی تصویر کوچک ممنوع می‌شود.
- فایل خام پس از پردازش موفق نگهداری نمی‌شود؛ checksum ورودی و metadata محدود ثبت می‌شوند.
- ابتدا فایل در پوشه موقت همان volume نوشته می‌شود و variantها با rename اتمیک به مسیر نهایی منتقل می‌شوند.
- object key از UUID/CUID تصادفی ساخته می‌شود و نام اصلی کاربر مسیر فایل نیست.
- path traversal، symlink escape، HTML، SVG، فایل اجرایی و تصویر خراب رد می‌شوند.

### 6.2 وضعیت‌ها

`MediaAsset.status` یکی از این مقادیر است:

- `PROCESSING`: رکورد ایجاد شده و پردازش یا نهایی‌سازی در جریان است.
- `READY`: تمام variantهای لازم موجود و قابل اتصال هستند.
- `FAILED`: پردازش یا نهایی‌سازی شکست خورده و قابل اتصال نیست.
- `DELETION_PENDING`: حذف منطقی پذیرفته شده و پاک‌سازی فیزیکی در انتظار است.
- `DELETED`: دارایی دیگر قابل انتخاب یا دریافت نیست.

عمومی‌بودن status نیست؛ از reference فعال به محتوای Published محاسبه می‌شود.

## 7. مدل داده و سازگاری

### 7.1 MediaAsset

حداقل شامل `id`, `status`, `storageProvider`, `objectPrefix`, `sourceSha256`, `mimeType`, `width`, `height`, `bytes`, `variants`, `originalName`, `defaultAlt`, `createdById`, `createdAt`, `updatedAt`, `deletedAt?` است. مسیر مطلق، خطای داخلی و credential وارد DTO عمومی نمی‌شوند.

### 7.2 MediaReference

حداقل شامل `id`, `mediaAssetId`, یکی از `productId` یا `articleId`, `usage`, `position`, `altOverride`, `createdAt`, `updatedAt` است. در v1 فقط `PRODUCT_GALLERY` و `ARTICLE_FEATURED` مجازند. SQL CHECK constraint تضمین می‌کند دقیقاً یک owner وجود دارد.

- برای هر مقاله حداکثر یک reference از نوع `ARTICLE_FEATURED` وجود دارد.
- موقعیت تصاویر محصول یکتا، پیوسته و از صفر شروع می‌شود؛ `position=0` همان cover است.
- حذف فیزیکی asset دارای reference فعال ممنوع است.

### 7.3 Legacy و projection

- `Product.images: Json` و `Article.featuredImage: Json?` در این change حذف نمی‌شوند.
- payload تصویر یک union معتبر از `{url, alt}` برای Legacy و `{mediaAssetId, alt}` برای Managed است.
- URL managed media فقط در Backend ساخته می‌شود؛ ارسال هم‌زمان `url` و `mediaAssetId` رد می‌شود.
- `MediaReference` منبع حقیقت بخش Managed و JSON موجود projection سازگار با public DTO است.
- URLهای `/catalog/*` و HTTP/HTTPS تاریخی در JSON باقی می‌مانند و reference ساختگی نمی‌گیرند.
- در ذخیره محصول/مقاله، referenceها و JSON projection در یک transaction دیتابیس نوشته می‌شوند.
- `featuredImage: null` هر reference شاخص managed و projection قبلی را پاک می‌کند.

## 8. API

### 8.1 مدیریت

| Method | Path | نتیجه |
|---|---|---|
| `POST` | `/api/v1/admin/media` | آپلود multipart و ایجاد asset آماده |
| `GET` | `/api/v1/admin/media` | جست‌وجو، فیلتر و pagination محدود |
| `GET` | `/api/v1/admin/media/:id` | metadata و reference count |
| `GET` | `/api/v1/admin/media/:id/preview` | stream خصوصی variant و `no-store` |
| `PATCH` | `/api/v1/admin/media/:id` | ویرایش default alt |
| `DELETE` | `/api/v1/admin/media/:id` | حذف منطقی asset بدون reference |

### 8.2 عمومی

`GET /api/v1/media/public/:id/:variant` فقط variantهای `thumb`, `card`, `detail` را می‌پذیرد. پاسخ موفق دارای WebP، `nosniff`, `ETag` و در rollout اولیه `Cache-Control: public, max-age=300` است. رسانه Draft، Archived، Failed یا Deleted بدون reference عمومی با پاسخ غیرقابل‌تشخیص `404` پنهان می‌شود.

### 8.3 خطاهای پایدار

`MEDIA_INVALID_FILE`, `MEDIA_TOO_LARGE`, `MEDIA_NOT_READY`, `MEDIA_INVALID_REFERENCE`, `MEDIA_IN_USE`, `MEDIA_NOT_FOUND`, `MEDIA_STORAGE_UNAVAILABLE`, `CONTENT_VERSION_CONFLICT` با HTTP status متناسب و بدون افشای مسیر، stack یا جزئیات داخلی بازگردانده می‌شوند.

## 9. کنترل هم‌زمانی

- `contentVersion` افزایشی به Product و Article اضافه می‌شود.
- Media UI در update مقدار `expectedVersion` می‌فرستد و mismatch با `409 CONTENT_VERSION_CONFLICT` رد می‌شود.
- payloadهای legacy در rollout اولیه قابل خواندن و نوشتن باقی می‌مانند، ولی هر write شامل `mediaAssetId` الزاماً versioned است.
- حذف یا detach رسانه بین زمان بازشدن فرم و Save نباید asset مشترک را حذف کند.

## 10. تجربه کاربری

- صفحه `/admin/media` برای Grid/List، جست‌وجو، pagination، preview، ابعاد، حجم، وضعیت و reference count ایجاد می‌شود.
- فرم محصول Dropzone چندفایلی، progress مستقل، انتخاب از Library، reorder لمسی/ماوس و کنترل بالا/پایین کیبوردی، cover، preview و alt اجباری دارد.
- ویرایشگر Legacy URL فقط برای ردیف‌های تاریخی نمایش داده می‌شود.
- فرم مقاله انتخاب، آپلود، جایگزینی و حذف صریح تصویر شاخص را ارائه می‌کند.
- UI فارسی، RTL و mobile-first است و در 360، 390، 768 و 1280، تم روشن/تاریک و حالت‌های loading/empty/error/disabled/conflict بررسی می‌شود.
- dialogها focus trap، کنترل بازگشت فوکوس و aria-live برای پیشرفت/خطا دارند.

## 11. امنیت و عملیات

- محدودیت stream قبل و حین دریافت، rate limit، quota actor و سقف concurrency الزامی است.
- binary، token، cookie، absolute path و نام داخلی فایل در log ثبت نمی‌شوند.
- health/readiness توان خواندن/نوشتن Mount و حداقل فضای آزاد را بدون افشای مسیر عمومی بررسی می‌کند.
- asset آماده ولی بدون reference پس از 30 روز با job دارای dry-run، audit و grace period پاک می‌شود؛ temp file پس از 24 ساعت پاک می‌شود.
- backup شامل PostgreSQL و Media Storage است و restore rehearsal باید consistency را با manifest و checksum بررسی کند.
- export/verify tool باید manifest قابل‌حمل از assetها، keyها، variantها، اندازه و checksum تولید کند.

## 12. Runflare v1 و مهاجرت آینده

### 12.1 preflight اجباری

پیش از Apply تولیدی باید پلن غیررایگان، ظرفیت دیسک، mount path واقعی، read/write کاربر Node، محدودیت proxy، دامنه HTTPS، تعداد Replica و امکان backup/restore تأیید شوند. restart و redeploy باید حفظ یک فایل آزمایشی را ثابت کنند.

### 12.2 فرایند مهاجرت

1. mutationهای رسانه موقتاً متوقف شوند.
2. backup هماهنگ DB و Storage گرفته شود.
3. object keyها بدون تغییر به مقصد جدید کپی شوند.
4. manifest و checksum تمام variantها مقایسه شوند.
5. Adapter و env مقصد deploy شوند.
6. preview خصوصی و public delivery smoke-test شوند.
7. DNS یا routing دامنه متعلق به ترنج در صورت نیاز تغییر کند.
8. Storage قدیمی برای بازه rollback به‌صورت read-only حفظ شود.

## 13. Rollout و rollback

1. change `add-staff-access-management` باید verify و archive شده باشد.
2. migration افزایشی MediaAsset/MediaReference/contentVersion روی PostgreSQL disposable دارای `test` اجرا شود.
3. Backend سازگار با Legacy پیش از UI جدید deploy شود.
4. Runflare Disk و readiness preflight فعال شوند.
5. UI Media Library و فرم‌ها فعال شوند.
6. publication boundary، cleanup، backup و restore در staging ثابت شوند.

Rollback نرم‌افزار با deploy نسخه قبلی و حفظ schema و فایل‌ها انجام می‌شود. حذف جدول، disk یا فایل‌های جدید بدون backup و export تأییدشده ممنوع است.

## 14. معیار پذیرش

1. Admin/Operator فایل معتبر را آپلود و preview می‌کنند؛ Customer/Sales با 403 رد می‌شوند.
2. MIME جعلی، SVG، فایل خراب، بیش از 8 MiB یا بیش از سقف پیکسل بدون فایل دائمی رد می‌شود.
3. محصول Draft دارای managed media در public endpoint پاسخ 404 می‌گیرد.
4. پس از Publish، variantهای public با URL پایدار قابل دریافت‌اند.
5. reorder محصول cover و ترتیب public را دقیق حفظ می‌کند.
6. asset مشترک یا reference‌دار حذف فیزیکی نمی‌شود.
7. `featuredImage: null` تصویر شاخص را بدون exception پاک می‌کند.
8. تصاویر `/catalog/*` و URLهای تاریخی بدون شکست باقی می‌مانند.
9. storage failure یا DB rollback هیچ reference شکسته منتشر نمی‌کند.
10. ویرایش هم‌زمان managed media با conflict امن متوقف می‌شود.
11. restart/redeploy Runflare فایل را در همان URL حفظ می‌کند.
12. backup و restore هماهنگ، manifest و checksum معتبر تولید می‌کند.
13. export/copy/verify به storage آزمایشی دیگر بدون تغییر media id یا public URL موفق است.
14. UI در چهار عرض، هر دو تم و با کیبورد بدون overflow و مانع دسترسی کار می‌کند.
15. lint، typecheck، unit، PostgreSQL integration، filesystem integration، backend/frontend E2E، build، architecture check و OpenSpec strict سبز هستند.

## 15. Definition of Done

- قراردادها و تمام acceptance scenarioها در OpenSpec قابل ردیابی‌اند.
- migration و rollback notes، ADR، env example، Runflare runbook و migration runbook ثبت شده‌اند.
- امنیت upload، publication boundary، concurrency، cleanup و failure recovery تست منفی دارند.
- restore rehearsal و انتقال آزمایشی provider-neutral با checksum اثبات شده‌اند.
- هیچ credential، مسیر محرمانه، فایل خصوصی یا داده شخصی وارد Git، public DTO یا log نشده است.
