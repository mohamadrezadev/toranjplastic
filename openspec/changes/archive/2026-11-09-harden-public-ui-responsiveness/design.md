## Context

رابط عمومی Next.js از Server Components، route-level `loading.tsx`/`error.tsx`، CSS Modules و componentهای مشترک content/feedback/navigation استفاده می‌کند. صفحه اصلی artwork عریضی دارد که متن و ظاهر CTA در آن رندر شده و لینک‌های واقعی به‌صورت hotspot روی تصویر قرار گرفته‌اند. گرید قابلیت‌ها در breakpoint حداکثر 48rem مستقیماً از سه ستون به یک ستون می‌رود و گرید مشترک محتوا تعداد ستون ثابت دارد.

این change frontend-only است، اما باید failure پاسخ‌های Backend و Strapi را بدون افشای جزئیات داخلی مدیریت کند. قرارداد API، DTO و persistence تغییر نمی‌کند. PRD مرجع این change در `docs/public-ui-responsiveness-prd.md` است.

## Goals / Non-Goals

**Goals:**

- پایان‌دادن قطعی به loading درخواست خواندنی شکست‌خورده و رساندن failure به ErrorState قابل‌بازیابی؛
- تبدیل Hero به composition معنایی با heading و CTA واقعی و media پشتیبان بدون متن تکراری؛
- ایجاد چیدمان تدریجی یک/دو/سه‌ستونه و رفتار متعادل برای تعداد آیتم متغیر؛
- یکپارچه‌کردن CTA پایانی، media surfaceها و فوتر با تم و viewport؛
- اثبات رفتار با component test و Playwright در viewportها و تم‌های الزامی.

**Non-Goals:**

- تغییر API، schema، CMS، مدل داده، authentication یا authorization؛
- افزودن ecommerce، قیمت، موجودی، پرداخت یا ادعای تجاری/فنی جدید؛
- بازطراحی Admin، پورتال مشتری یا فرم استعلام خصوصی؛
- معرفی dependency runtime جدید یا framework بصری موازی.

## Decisions

### 1. failure خواندنی در مرز route به خطا تبدیل می‌شود

صفحات collection و managed content رفتار dynamic خود را مطابق مستندات محلی Next.js 16 صریح می‌کنند تا rejection درخواست سرور به `error.tsx` برسد و route-level loading به حالت دائمی تبدیل نشود. `PublicContentError` همچنان جزئیات داخلی را پنهان می‌کند و ErrorState فقط پیام عمومی فارسی و retry idempotent ارائه می‌دهد.

**چرایی:** error boundary مشترک از قبل وجود دارد؛ اصلاح مرز rendering کم‌ریسک‌تر از افزودن fetch client-side یا state manager جدید است.

**گزینه ردشده:** انتقال collection fetch به Client Component. این گزینه JavaScript و hydration غیرضروری اضافه می‌کند و با Server Component پیش‌فرض پروژه ناسازگار است.

### 2. Hero از hotspot رستری به composition دو‌بخشی تبدیل می‌شود

Hero شامل copy معنایی و CTAهای واقعی در یک ستون و media در ستون دیگر خواهد بود. artwork تأییدشده موجود به‌صورت crop کنترل‌شده استفاده می‌شود تا ناحیه متن/CTA رستری داخل viewport media دیده نشود؛ بنابراین asset ساختگی یا ادعای جدید لازم نیست. در موبایل media و copy یک بار و با ترتیب خواندن مشخص نمایش داده می‌شوند.

**چرایی:** محتوا قابل‌دسترسی، قابل‌تغییر و مستقل از مقیاس تصویر می‌شود و duplication فعلی حذف می‌شود.

**گزینه ردشده:** حفظ تصویر کامل و hotspotهای نامرئی؛ این روش در موبایل متن را تکرار و در ابعاد میانی نوشته رستری را ناخوانا می‌کند.

### 3. CSS Grid با breakpoint میانی و modifier تعداد آیتم استفاده می‌شود

کارت‌های قابلیت صفحه اصلی در موبایل یک ستون، در تبلت دو ستون و در دسکتاپ سه ستون خواهند بود. گرید مشترک ContentGrid تعداد child را از component دریافت می‌کند و modifier `single`/`pair` یا معادل data attribute اعمال می‌کند تا یک و دو آیتم track خالی نسازند. اندازه media با aspect-ratio محدود و card body با ارتفاع طبیعی حفظ می‌شود.

**چرایی:** CSS خالص برای layout کافی است، اما تعداد child در Server Component با class صریح قابل‌اعتمادتر از selectorهای پیچیده و ناسازگار است.

**گزینه ردشده:** `auto-fit` بدون سقف عرض؛ می‌تواند یک کارت را تا عرض نامناسب desktop بکشاند و compositionهای detail/featured را ناخواسته تغییر دهد.

### 4. CTA پایانی به یک بلوک copy + action محدود می‌شود

شماره بخش داخل بلوک copy قرار می‌گیرد و action در همان grid نزدیک متن نگه داشته می‌شود. desktop دو ستون و mobile یک ستون خواهد داشت؛ فاصله‌ها از tokenهای موجود استفاده می‌کنند.

### 5. media surface تم‌محور بدون دستکاری تصویر

تصاویر روشن داخل یک surface خنثی با padding/border ثابت قرار می‌گیرند و خود bitmap فیلتر رنگی نمی‌شود. CTA اصلی و secondary از semantic tokenهای موجود استفاده می‌کنند و focus ring حفظ می‌شود.

**چرایی:** فیلترکردن عکس محصول رنگ واقعی آن را تحریف می‌کند؛ قاب تم‌محور جداسازی کافی ایجاد می‌کند.

### 6. فوتر موبایل با disclosure دسترس‌پذیر فشرده می‌شود

ستون برند و تماس اصلی همیشه باز می‌مانند. گروه‌های navigation در عرض موبایل با semantic `details/summary` نمایش داده می‌شوند و در tablet/desktop به ستون عادی برمی‌گردند. محتوای essential بدون JavaScript در دسترس است و جهت داده‌های LTR حفظ می‌شود.

**گزینه ردشده:** حذف لینک‌ها یا carousel افقی؛ اولی قرارداد محتوا را ناقص می‌کند و دومی keyboard/RTL را پیچیده می‌کند.

### 7. تست‌ها رفتار را اندازه‌گیری می‌کنند، نه screenshot باینری را

Vitest رفتار feedback و modifierهای گرید را بررسی می‌کند. Playwright عرض document، تعداد ستون مؤثر، ابعاد نسبی کارت‌ها، visibility/focus CTA، بازشدن footer disclosure و failure route mocked را در 360، 390، 768 و 1280 بررسی می‌کند. visual review مکمل است، اما فایل snapshot تصویری جدید الزام نیست.

## Risks / Trade-offs

- **[Risk] crop artwork در نسبت‌های خاص بخش نامناسبی از محصول را نشان دهد.** → `object-position` و wrapper محدود در چهار viewport و نقطه مجاور breakpoint بازبینی می‌شوند.
- **[Risk] تغییر dynamic rendering روی performance یا caching عمومی اثر بگذارد.** → فقط routeهای `no-store` فعلی صریح می‌شوند، contract cache گسترش نمی‌یابد و build/E2E بررسی می‌شود.
- **[Risk] disclosure فوتر باعث تفاوت DOM بین mobile و desktop شود.** → یک markup معنایی مشترک استفاده می‌شود و CSS فقط presentation را تغییر می‌دهد.
- **[Risk] یک modifier جدید ContentGrid مصرف‌کننده‌های دیگر را تغییر دهد.** → default سه‌ستونه حفظ و تست component برای 1/2/3 child اضافه می‌شود.
- **[Trade-off] استفاده از crop asset فعلی نسبت به asset بدون نوشته انعطاف کمتری دارد.** → این انتخاب از تولید asset تأییدنشده جلوگیری می‌کند و در change بعدی قابل جایگزینی است.

## Migration Plan

1. تست‌های failure و responsive ابتدا اضافه یا هم‌زمان با component مربوط تکمیل شوند.
2. feedback/dynamic route behavior اصلاح و مستقل verify شود.
3. Hero و grid breakpoints اعمال و در چهار viewport بازبینی شوند.
4. گرید کم‌تعداد، CTA پایانی، media treatment و footer disclosure تکمیل شوند.
5. lint، typecheck، unit/component، Playwright مرتبط، architecture check و build اجرا شوند.
6. rollout به‌صورت deploy frontend انجام شود؛ migration یا backfill وجود ندارد.

Rollback با بازگرداندن commit رابط انجام می‌شود. API، داده و asset موجود حذف نمی‌شوند، بنابراین rollback نیازمند migration معکوس نیست.

## Open Questions

- Open question محصولی باقی نمانده است. اگر در بازبینی بصری crop artwork تأییدشدنی نباشد، پیاده‌سازی باید متوقف شود و asset بدون متن از منبع هویت بصری درخواست شود؛ تولید ادعای تصویری جایگزین مجاز نیست.
