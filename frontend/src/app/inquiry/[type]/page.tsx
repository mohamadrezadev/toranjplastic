import { notFound } from "next/navigation";
import { getMaterial, getProduct, getService, listMaterials, listProducts, listServices } from "@/lib/public-content";
import { InquiryForm } from "../InquiryForm";
import styles from "../Inquiry.module.css";

const titles = { product: "استعلام محصول", injection: "درخواست خدمات تزریق", material: "درخواست مواد اولیه", contact: "تماس عمومی" } as const;
type Kind = keyof typeof titles;
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
  return <main className={styles.main}><section className={styles.shell}><p className={styles.eyebrow}>پنل مشتری</p><h1>{titles[kind]}</h1><p>فقط اطلاعاتی را وارد کنید که از آن مطمئن هستید؛ فیلدهای اختیاری را می‌توانید خالی بگذارید.</p><InquiryForm kind={kind} options={options} selectedId={selectedId}/></section></main>;
}
