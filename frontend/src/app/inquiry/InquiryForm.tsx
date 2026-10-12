"use client";
import { useActionState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { createInquiryAction, type InquiryFormState } from "./actions";
import styles from "./Inquiry.module.css";

type Kind = "product"|"injection"|"material"|"contact";
interface Option { id: string; name: string }
export function InquiryForm({ kind, options = [], selectedId }: { kind: Kind; options?: Option[]; selectedId?: string }) {
  const [state, action, pending] = useActionState<InquiryFormState, FormData>(createInquiryAction, {});
  return <form action={action} className={styles.form}>
    <input type="hidden" name="kind" value={kind}/>
    {kind === "product" ? <Select label="محصول" name="productId" required defaultValue={selectedId ?? ""}><option value="">انتخاب محصول</option>{options.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</Select> : null}
    {kind === "injection" ? <><Select label="خدمت مرتبط (اختیاری)" name="injectionServiceId" defaultValue={selectedId ?? ""}><option value="">بدون انتخاب</option>{options.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</Select><Textarea label="شرح قطعه" name="partDescription" required maxLength={4000}/><Input label="وضعیت قالب" name="moldStatus" helpText="مثلاً قالب موجود است، نیاز به بررسی دارد یا اطلاع ندارم." maxLength={240}/><Input label="ماده در صورت اطلاع" name="materialName" maxLength={240}/><Input label="رنگ در صورت اطلاع" name="color" maxLength={160}/></> : null}
    {kind === "material" ? <><Select label="ماده مرتبط (اختیاری)" name="materialId" defaultValue={selectedId ?? ""}><option value="">بدون انتخاب</option>{options.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="نوع درخواست" name="materialRequestKind" required><option value="">انتخاب کنید</option><option value="PRICE_QUOTE">استعلام قیمت</option><option value="SUPPLY_REQUEST">درخواست تأمین</option><option value="AVAILABILITY_REVIEW">بررسی امکان تأمین</option></Select><Input label="نام ماده یا نوع پلیمر" name="polymerName" required maxLength={240}/><Input label="گرید (اختیاری)" name="grade" maxLength={160}/><Input label="برند (اختیاری)" name="brand" maxLength={160}/><Select label="نوع ماده در صورت اطلاع" name="materialCondition"><option value="">اطلاع ندارم</option><option value="NEW">نو</option><option value="RECYCLED">بازیافتی</option></Select><Input label="واحد مقدار" name="quantityUnit" maxLength={80}/><Textarea label="کاربرد" name="application" maxLength={1000}/><Textarea label="مشخصات" name="specifications" maxLength={2000}/><Input label="رنگ" name="color" maxLength={160}/></> : null}
    {kind !== "contact" ? <><Input label="مقدار تقریبی (اختیاری)" name="approximateQuantity" maxLength={120}/><Input label="شهر یا محل تحویل" name="deliveryCity" maxLength={120}/><Input label="زمان موردنیاز" name="requestedTiming" helpText="می‌توانید بازه یا توضیح آزاد وارد کنید." maxLength={160}/></> : null}
    <Textarea label={kind === "contact" ? "متن درخواست" : "توضیحات تکمیلی"} name="description" required={kind === "contact"} maxLength={4000}/>
    <p className={styles.notice}>پیوست فایل در این مرحله فعال نیست. پس از تصویب سیاست ذخیره‌سازی امن اضافه خواهد شد.</p>
    {state.error ? <p role="alert" className={styles.error}>{state.error}</p> : null}
    <Button type="submit" isLoading={pending} disabled={pending} loadingText="در حال ثبت…">ثبت درخواست</Button>
  </form>;
}
