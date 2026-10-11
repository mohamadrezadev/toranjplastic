# Catalog products rollback

این migration فقط دو دسته و نه محصول با شناسه‌های ثابت `catalog-*` اضافه می‌کند. قبل از rollback از PostgreSQL نسخه پشتیبان بگیرید و صحت آن را بررسی کنید.

1. نسخه برنامه را به قبل از نمایش محصولات کاتالوگ برگردانید.
2. بررسی کنید رکوردهای زیر به داده دیگری وابسته نشده باشند.
3. فقط محصولات با شناسه‌های زیر را حذف کنید:
   - `catalog-product-liquid-dispenser`
   - `catalog-product-spice-dispenser`
   - `catalog-product-refrigerator-organizer`
   - `catalog-product-car-wash-hose-connector`
   - `catalog-product-broom-head-base`
   - `catalog-product-broom-bushing`
   - `catalog-product-toilet-brush`
   - `catalog-product-broom-head`
   - `catalog-product-pedal-bin`
4. سپس فقط دسته‌های `catalog-category-kitchenware` و `catalog-category-cleaning` را حذف کنید.

حذف با slug یا حذف دسته‌ای بدون شرط مجاز نیست. در rollback عادی می‌توان رکوردها را بدون ارجاع در پایگاه داده نگه داشت و فقط کد نمایش را برگرداند.
