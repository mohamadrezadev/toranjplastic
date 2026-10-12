"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { createInquiryAction, type InquiryFormState } from "./actions";
import styles from "./Inquiry.module.css";

type Kind = "product" | "injection" | "material" | "contact";
interface Option { id: string; name: string }

const stepTitles: Record<Kind, string[]> = {
  product: ["موضوع درخواست", "مقدار و تحویل", "توضیحات تکمیلی"],
  injection: ["موضوع درخواست", "اطلاعات فنی", "مقدار و تحویل", "توضیحات تکمیلی"],
  material: ["موضوع درخواست", "مشخصات فنی", "مقدار و تحویل", "توضیحات تکمیلی"],
  contact: ["شرح درخواست"],
};

function FormSection({ step, title, description, active, children }: { step: number; title: string; description?: string; active: boolean; children: ReactNode }) {
  return <fieldset className={styles.section} data-step-panel={step} hidden={!active}>
    <legend tabIndex={-1}><span className={styles.legendInner}><span className={styles.sectionIndex} aria-hidden="true">{String(step + 1).padStart(2, "0")}</span><span>{title}</span></span></legend>
    {description ? <p className={styles.sectionDescription}>{description}</p> : null}
    <div className={styles.fieldGrid}>{children}</div>
  </fieldset>;
}

const formLabels: Record<Kind, string> = {
  product: "فرم استعلام محصول",
  injection: "فرم درخواست خدمات تزریق پلاستیک",
  material: "فرم درخواست مواد اولیه",
  contact: "فرم تماس عمومی",
};

export function InquiryForm({ kind, options = [], selectedId }: { kind: Kind; options?: Option[]; selectedId?: string }) {
  const [state, action, pending] = useActionState<InquiryFormState, FormData>(createInquiryAction, {});
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const shouldFocusStep = useRef(false);
  const titles = stepTitles[kind];
  const finalStep = titles.length - 1;
  const isLastStep = currentStep === finalStep;

  useEffect(() => {
    if (!shouldFocusStep.current) return;
    formRef.current?.querySelector<HTMLElement>(`[data-step-panel="${currentStep}"] legend`)?.focus();
    shouldFocusStep.current = false;
  }, [currentStep]);

  const moveTo = (step: number) => {
    shouldFocusStep.current = true;
    setCurrentStep(step);
  };

  const validateCurrentStep = () => {
    const panel = formRef.current?.querySelector<HTMLFieldSetElement>(`[data-step-panel="${currentStep}"]`);
    if (!panel) return false;
    const invalid = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"))
      .find((control) => !control.checkValidity());
    if (!invalid) return true;
    invalid.reportValidity();
    invalid.focus();
    return false;
  };

  const goNext = () => {
    if (validateCurrentStep() && currentStep < finalStep) moveTo(currentStep + 1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isLastStep) return;
    event.preventDefault();
    goNext();
  };

  return <form ref={formRef} action={action} onSubmit={handleSubmit} className={styles.form} aria-label={formLabels[kind]}>
    <input type="hidden" name="kind" value={kind} />

    <section className={styles.progress} aria-label="پیشرفت فرم درخواست">
      <div className={styles.progressHeading} role="status" aria-live="polite">
        <span>مرحله {currentStep + 1} از {titles.length}</span>
        <strong>{titles[currentStep]}</strong>
      </div>
      <ol className={styles.stepList}>
        {titles.map((title, index) => <li key={title} data-state={index === currentStep ? "current" : index < currentStep ? "complete" : "upcoming"}>
          <span className={styles.stepDot}>{index < currentStep ? "✓" : index + 1}</span>
          <span className={styles.stepLabel}>{title}</span>
        </li>)}
      </ol>
      <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${((currentStep + 1) / titles.length) * 100}%` }} /></div>
    </section>

    {kind !== "contact" ? <FormSection step={0} title="موضوع درخواست" active={currentStep === 0} description="نوع درخواست و زمینه اصلی آن را مشخص کنید.">
      {kind === "product" ? <Select label="محصول" name="productId" required defaultValue={selectedId ?? ""}><option value="">انتخاب محصول</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> : null}
      {kind === "injection" ? <><Select label="خدمت مرتبط (اختیاری)" name="injectionServiceId" defaultValue={selectedId ?? ""}><option value="">بدون انتخاب</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Textarea label="شرح قطعه" name="partDescription" required maxLength={4000} helpText="کاربرد، ابعاد یا ویژگی‌هایی را که برای بررسی اولیه مهم است توضیح دهید." /></> : null}
      {kind === "material" ? <><Select label="ماده مرتبط (اختیاری)" name="materialId" defaultValue={selectedId ?? ""}><option value="">بدون انتخاب</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select label="نوع درخواست" name="materialRequestKind" required><option value="">انتخاب کنید</option><option value="PRICE_QUOTE">استعلام قیمت</option><option value="SUPPLY_REQUEST">درخواست تأمین</option><option value="AVAILABILITY_REVIEW">بررسی امکان تأمین</option></Select><Input label="نام ماده یا نوع پلیمر" name="polymerName" required maxLength={240} /></> : null}
    </FormSection> : null}

    {kind === "injection" ? <FormSection step={1} title="اطلاعات فنی" active={currentStep === 1} description="اگر درباره هر مورد مطمئن نیستید، آن را خالی بگذارید.">
      <Input label="وضعیت قالب" name="moldStatus" helpText="مثلاً قالب موجود است، نیاز به بررسی دارد یا اطلاع ندارم." maxLength={240} />
      <Input label="ماده در صورت اطلاع" name="materialName" maxLength={240} />
      <Input label="رنگ در صورت اطلاع" name="color" maxLength={160} />
    </FormSection> : null}

    {kind === "material" ? <FormSection step={1} title="مشخصات فنی" active={currentStep === 1} description="مشخصات معلوم را ثبت کنید؛ هیچ مقدار فنی به‌صورت خودکار فرض نمی‌شود.">
      <Input label="گرید (اختیاری)" name="grade" maxLength={160} />
      <Input label="برند (اختیاری)" name="brand" maxLength={160} />
      <Select label="نوع ماده در صورت اطلاع" name="materialCondition"><option value="">اطلاع ندارم</option><option value="NEW">نو</option><option value="RECYCLED">بازیافتی</option></Select>
      <Input label="رنگ" name="color" maxLength={160} />
      <Textarea label="کاربرد" name="application" maxLength={1000} />
      <Textarea label="مشخصات" name="specifications" maxLength={2000} />
    </FormSection> : null}

    {kind !== "contact" ? <FormSection step={kind === "product" ? 1 : 2} title="مقدار و تحویل" active={currentStep === (kind === "product" ? 1 : 2)} description="مقادیر تقریبی هستند و در این مرحله تعهد قیمت، موجودی یا زمان تحویل ایجاد نمی‌کنند.">
      <Input label="مقدار تقریبی (اختیاری)" name="approximateQuantity" maxLength={120} />
      {kind === "material" ? <Input label="واحد مقدار" name="quantityUnit" maxLength={80} /> : null}
      <Input label="شهر یا محل تحویل" name="deliveryCity" maxLength={120} />
      <Input label="زمان موردنیاز" name="requestedTiming" helpText="می‌توانید بازه یا توضیح آزاد وارد کنید." maxLength={160} />
    </FormSection> : null}

    <FormSection step={finalStep} active={isLastStep} title={kind === "contact" ? "شرح درخواست" : "توضیحات تکمیلی"} description="هر نکته‌ای که به بررسی دقیق‌تر درخواست کمک می‌کند بنویسید.">
      <Textarea label={kind === "contact" ? "متن درخواست" : "توضیحات تکمیلی"} name="description" required={kind === "contact"} maxLength={4000} />
    </FormSection>

    {isLastStep ? <p className={styles.notice}><span className={styles.noticeMark} aria-hidden="true">i</span><span>پیوست فایل در این مرحله فعال نیست و پس از تصویب سیاست ذخیره‌سازی امن اضافه خواهد شد.</span></p> : null}
    <div className={styles.formFooter}>
      {state.error && isLastStep ? <p role="alert" className={styles.error}>{state.error}</p> : null}
      <div className={styles.wizardActions}>
        {currentStep > 0 ? <Button type="button" variant="secondary" onClick={() => moveTo(currentStep - 1)}>مرحله قبل</Button> : null}
        {!isLastStep ? <Button type="button" onClick={(event) => { event.preventDefault(); goNext(); }}>مرحله بعد</Button> : <Button type="submit" isLoading={pending} disabled={pending} loadingText="در حال ثبت…">ثبت درخواست</Button>}
      </div>
    </div>
  </form>;
}
