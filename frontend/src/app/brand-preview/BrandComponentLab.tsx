"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Button } from "@astryxdesign/core/Button";
import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Divider } from "@astryxdesign/core/Divider";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { LayoutContent } from "@astryxdesign/core/Layout";
import { Pagination } from "@astryxdesign/core/Pagination";
import { Section } from "@astryxdesign/core/Section";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Switch } from "@astryxdesign/core/Switch";
import { Table, type TableColumn } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { VStack } from "@astryxdesign/core/VStack";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DirectionalData } from "@/components/ui";

const swatches = [
  { name: "نفتی اصلی", token: "color-brand-primary", variant: "teal" },
  { name: "سنگ روشن", token: "color-surface-canvas", variant: "muted" },
  { name: "سطح کارت", token: "color-surface-card", variant: "default" },
] as const;

interface LabRow extends Record<string, unknown> {
  id: string;
  title: string;
  state: string;
  reference: string;
}

const labRows: LabRow[] = [
  { id: "one", title: "ردیف نمایشی یک", state: "آماده بررسی", reference: "TRJ-DEMO-001" },
  { id: "two", title: "ردیف نمایشی دو", state: "پیش‌نویس", reference: "TRJ-DEMO-002" },
  { id: "three", title: "ردیف نمایشی سه", state: "بایگانی نمایشی", reference: "TRJ-DEMO-003" },
];

const labColumns: TableColumn<LabRow>[] = [
  { key: "title", header: "عنوان" },
  { key: "state", header: "وضعیت" },
  { key: "reference", header: "شناسه", renderCell: (row) => <DirectionalData>{row.reference}</DirectionalData> },
];

export function BrandComponentLab() {
  const [contactName, setContactName] = useState("نگین محمدی");
  const [description, setDescription] = useState("برای بررسی اولیه، مشخصات قطعه و تصویر قالب ارسال می‌شود.");
  const [hasDrawing, setHasDrawing] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [page, setPage] = useState(2);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <LayoutContent label="آزمایشگاه رابط کاربری ترنج" padding={0} isScrollable={false}>
      <Section variant="muted" padding={6}>
        <HStack hAlign="center">
          <VStack gap={4} width="100%" maxWidth={1120}>
            <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
              <VStack gap={1}>
                <Text color="accent" weight="semibold">پیش‌نمایش داخلی · noindex</Text>
                <Heading level={1} type="display-3" textWrap="balance">آزمایشگاه رابط کاربری ترنج</Heading>
                <Text color="secondary" as="p">
                  نگاشت کنترل‌شده‌ی ASTRYX به فارسی، راست‌به‌چپ و هویت نفتی‌ـ‌سنگی ترنج؛ بدون تغییر قرارداد محصول.
                </Text>
              </VStack>
              <HStack gap={2} vAlign="center">
                <Text color="secondary">حالت نمایش</Text>
                <ThemeToggle />
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </Section>

      <HStack hAlign="center" paddingInline={4} paddingBlockStart={8} paddingBlockEnd={10}>
      <VStack width="100%" maxWidth={1120} gap={6}>
        <Banner
          status="info"
          title="محدوده این صفحه"
          description="این آزمایشگاه فقط برای ارزیابی اجزای رابط کاربری است؛ قیمت، ظرفیت، موجودی یا ادعای فنی جدیدی نمایش نمی‌دهد."
        />

        <Section variant="transparent" padding={0}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>رنگ، تایپوگرافی و جهت</Heading>
              <Text color="secondary" as="p">نمونه‌ها از توکن‌های تأییدشده پروژه استفاده می‌کنند و داده‌های لاتین به‌صورت مجزا نمایش داده می‌شوند.</Text>
            </VStack>
            <Grid columns={{ minWidth: 240, max: 3, repeat: "fit" }} gap={3}>
              {swatches.map((swatch) => (
                <Card key={swatch.token} padding={4} elevation="low" variant={swatch.variant}>
                  <VStack gap={1}>
                    <Text weight="semibold">{swatch.name}</Text>
                    <Text type="code" color="secondary"><DirectionalData>{swatch.token}</DirectionalData></Text>
                  </VStack>
                </Card>
              ))}
            </Grid>
          </VStack>
        </Section>

        <Divider />

        <Section variant="transparent" padding={0}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>ناوبری، لایه و داده ساخت‌یافته</Heading>
              <Text color="secondary" as="p">الگوهای جهت‌دار با ترتیب RTL، نام فارسی و بازگشت focus بررسی می‌شوند.</Text>
            </VStack>

            <TopNav
              label="ناوبری نمونه"
              heading={<TopNavHeading heading="ترنج" headingHref="/brand-preview" subheading="آزمایشگاه UI" />}
              startContent={
                <>
                  <TopNavItem label="نمای کلی" href="/brand-preview" isSelected />
                  <TopNavItem label="فرم‌ها" href="#lab-forms" />
                  <TopNavItem label="داده‌ها" href="#lab-data" />
                </>
              }
            />

            <Breadcrumbs label="مسیر نمونه" variant="supporting">
              <BreadcrumbItem href="/brand-preview">آزمایشگاه</BreadcrumbItem>
              <BreadcrumbItem href="#lab-data">الگوها</BreadcrumbItem>
              <BreadcrumbItem isCurrent>داده ساخت‌یافته</BreadcrumbItem>
            </Breadcrumbs>

            <VStack id="lab-data" gap={3}>
              <Table
                data={labRows}
                columns={labColumns}
                idKey="id"
                density="compact"
                dividers="rows"
                rowIndexStart={1}
                rowCount={labRows.length}
              />
              <Pagination
                page={page}
                onChange={setPage}
                totalPages={5}
                variant="compact"
                hasFirstLast
                label="صفحه‌بندی نمونه"
              />
            </VStack>

            <HStack gap={2} wrap="wrap">
              <Button label="بازکردن گفت‌وگوی نمونه" variant="secondary" onClick={() => setIsDialogOpen(true)} />
              <Text type="supporting">این گفت‌وگو فقط رفتار لایه و focus را نمایش می‌دهد.</Text>
            </HStack>

            <Dialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} purpose="info" width={520} padding={0}>
              <VStack gap={0}>
                <DialogHeader title="گفت‌وگوی نمونه" subtitle="بدون ثبت یا تغییر داده" onOpenChange={setIsDialogOpen} />
                <VStack gap={4} padding={4}>
                  <Text as="p">برای ادامه تست، این پنجره را با دکمه بستن یا کلید Escape ببندید.</Text>
                  <HStack gap={2} hAlign="end" wrap="wrap">
                    <Button label="بستن" variant="secondary" onClick={() => setIsDialogOpen(false)} />
                  </HStack>
                </VStack>
              </VStack>
            </Dialog>
          </VStack>
        </Section>

        <Divider />

        <Section id="lab-forms" variant="transparent" padding={0}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>کنترل‌های فرم استعلام</Heading>
              <Text color="secondary" as="p">نمونه‌ی تعاملی برای بررسی برچسب، متن راهنما، خطا، loading و disabled.</Text>
            </VStack>
            <Grid columns={{ minWidth: 320, max: 2, repeat: "fit" }} gap={4}>
              <Card padding={5} elevation="low">
                <VStack gap={4}>
                  <TextInput label="نام و نام خانوادگی" description="نام مسئول پیگیری درخواست" value={contactName} onChange={setContactName} isRequired />
                  <TextArea
                    label="توضیحات اولیه"
                    description="اطلاعات قطعه یا قالب را بدون درج داده محرمانه وارد کنید."
                    value={description}
                    onChange={setDescription}
                    rows={4}
                    maxLength={240}
                  />
                  <CheckboxInput label="نقشه یا تصویر فنی آماده است" value={hasDrawing} onChange={setHasDrawing} />
                  <Switch
                    label="اعلان تغییر وضعیت"
                    description="این نمونه فقط وضعیت محلی صفحه را تغییر می‌دهد."
                    value={notificationsEnabled}
                    onChange={setNotificationsEnabled}
                  />
                </VStack>
              </Card>
              <Card padding={5} elevation="low">
                <VStack gap={4}>
                  <TextInput
                    label="شماره پیگیری"
                    value="TRJ-1405-0217"
                    onChange={() => undefined}
                    isReadOnly
                    controlStyle={{ direction: "ltr", unicodeBidi: "isolate" }}
                  />
                  <TextInput
                    label="ایمیل تماس"
                    value="info@toranjplastic.com"
                    onChange={() => undefined}
                    type="email"
                    status={{ type: "success", message: "ساختار ایمیل معتبر است." }}
                    controlStyle={{ direction: "ltr", unicodeBidi: "isolate" }}
                  />
                  <TextInput
                    label="فیلد غیرفعال"
                    value="پس از انتخاب نوع درخواست فعال می‌شود"
                    onChange={() => undefined}
                    isDisabled
                    disabledMessage="ابتدا نوع درخواست را انتخاب کنید."
                  />
                  <HStack gap={2} wrap="wrap">
                    <Button label="ثبت نمونه" variant="primary" onClick={() => undefined} />
                    <Button label="ذخیره موقت" variant="secondary" onClick={() => undefined} />
                    <Button label="حذف" variant="destructive" onClick={() => undefined} />
                    <Button label="در حال بررسی" variant="ghost" isLoading onClick={() => undefined} />
                  </HStack>
                </VStack>
              </Card>
            </Grid>
          </VStack>
        </Section>

        <Divider />

        <Section variant="transparent" padding={0}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>حالت‌های بازخورد</Heading>
              <Text color="secondary" as="p">loading و empty باید معنا و اقدام بعدی روشن داشته باشند.</Text>
            </VStack>
            <Grid columns={{ minWidth: 280, max: 2, repeat: "fit" }} gap={4}>
              <Card padding={5} minHeight={240}>
                <VStack gap={3} hAlign="center" vAlign="center" minHeight={200}>
                  <Spinner size="lg" label="در حال دریافت اطلاعات درخواست" />
                  <Text color="secondary">در حال دریافت اطلاعات درخواست…</Text>
                </VStack>
              </Card>
              <Card padding={5} minHeight={240}>
                <EmptyState
                  headingLevel={3}
                  title="هنوز پیامی ثبت نشده است"
                  description="پس از ارسال پیام، پاسخ‌های مرتبط با همین درخواست در این بخش نمایش داده می‌شوند."
                  actions={<Button label="بازگشت به درخواست‌ها" variant="secondary" href="/account/inquiries" />}
                />
              </Card>
            </Grid>
          </VStack>
        </Section>

        <Divider />

        <Section variant="transparent" padding={0}>
          <VStack gap={3}>
            <Heading level={2}>مرجع برند موجود</Heading>
            <Text color="secondary" as="p">این تصویر همان فایل موجود پروژه است و در این تغییر بازتولید نشده است.</Text>
            <Card padding={3}>
              <AspectRatio ratio={16 / 9} fit="contain">
                <Image
                  src="/branding/preview/brand-preview-wide.png"
                  alt="پیش‌نمایش لوگو، آیکن‌ها و پالت بسته برند ترنج"
                  width={1600}
                  height={900}
                />
              </AspectRatio>
            </Card>
          </VStack>
        </Section>
      </VStack>
      </HStack>
    </LayoutContent>
  );
}
