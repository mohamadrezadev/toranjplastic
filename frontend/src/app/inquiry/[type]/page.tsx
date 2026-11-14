import { notFound } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Button } from "@/components/ui";
import { getMaterial, getProduct, getService, listMaterials, listProducts, listServices } from "@/lib/public-content";
import { InquiryForm } from "../InquiryForm";
import { InquiryHeader } from "../InquiryHeader";
import styles from "../Inquiry.module.css";

const titles = { product: "استعلام محصول", injection: "درخواست خدمات تزریق", material: "درخواست مواد اولیه", contact: "تماس عمومی" } as const;
type Kind = keyof typeof titles;
export const instant = false;
export default async function InquiryTypePage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ slug?: string }> }) {
  const { type } = await params;
  if (!(type in titles)) notFound();
  const kind = type as Kind;
  const { slug } = await searchParams;
  let options: Array<{id:string;name:string}> = [];
  if (kind === "product") options = (await listProducts(1)).items.map(({id,name})=>({id,name}));
  if (kind === "injection") options = (await listServices(1)).items.map(({id,name})=>({id,name}));
  if (kind === "material") options = (await listMaterials(1)).items.map(({id,name})=>({id,name}));
  let selectedId: string | undefined;
  if (slug && kind === "product") selectedId = (await getProduct(slug)).id;
  if (slug && kind === "injection") selectedId = (await getService(slug)).id;
  if (slug && kind === "material") selectedId = (await getMaterial(slug)).id;
  return (
    <VStack as="section" gap={5} className={styles.page}>
      <div><Button href="/inquiry" variant="secondary">بازگشت به انتخاب نوع درخواست</Button></div>
      <InquiryHeader eyebrow="پنل مشتری / فرم درخواست" title={titles[kind]} lead="فقط اطلاعاتی را وارد کنید که از آن مطمئن هستید؛ فیلدهای اختیاری را می‌توانید خالی بگذارید." />
      <Card variant="muted" className={styles.formIntro}>
        <VStack gap={2} hAlign="start">
          <Text as="span" weight="bold" color="inherit">پیش از ثبت درخواست</Text>
          <Text as="p" color="secondary">اطلاعات هر بخش را مرور کنید. پس از ثبت، درخواست در وضعیت «ثبت‌شده» قرار می‌گیرد و از بخش درخواست‌های من قابل پیگیری است.</Text>
        </VStack>
      </Card>
      <InquiryForm kind={kind} options={options} selectedId={selectedId}/>
    </VStack>
  );
}
