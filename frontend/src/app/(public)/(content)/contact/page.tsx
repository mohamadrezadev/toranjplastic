import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("contact", "تماس با ما");
export default function ContactPage() {
  return <ManagedPage slug="contact" fallbackTitle="تماس با ما" campaign={{ src: "/branding/banners/contact.png", alt: "دعوت به همکاری و تماس با ترنج پلاستیک", href: "#managed-content", actionLabel: "مشاهده راه‌های تماس با ترنج پلاستیک", testId: "contact-campaign" }} />;
}
