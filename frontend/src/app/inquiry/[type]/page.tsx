import { notFound } from "next/navigation";
import Link from "next/link";
import { getMaterial, getProduct, getService, listMaterials, listProducts, listServices } from "@/lib/public-content";
import { InquiryForm } from "../InquiryForm";
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
  return <section className={styles.page}><div><Link className={styles.backLink} href="/inquiry">بازگشت به انتخاب نوع درخواست</Link></div><header className={styles.pageHeader}><p className={styles.eyebrow}>پنل مشتری / فرم درخواست</p><h1>{titles[kind]}</h1><p className={styles.lead}>فقط اطلاعاتی را وارد کنید که از آن مطمئن هستید؛ فیلدهای اختیاری را می‌توانید خالی بگذارید.</p></header><div className={styles.formIntro}><strong>پیش از ثبت درخواست</strong><p>اطلاعات هر بخش را مرور کنید. پس از ثبت، درخواست در وضعیت «ثبت‌شده» قرار می‌گیرد و از بخش درخواست‌های من قابل پیگیری است.</p></div><InquiryForm kind={kind} options={options} selectedId={selectedId}/></section>;
}
