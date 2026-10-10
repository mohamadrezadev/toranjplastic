import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("contact", "تماس با ما");
export default function ContactPage() { return <ManagedPage slug="contact" fallbackTitle="تماس با ما" />; }
