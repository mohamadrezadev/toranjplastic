import type { Metadata } from "next";
import { Footer, Header } from "@/components/navigation";

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><div data-shell-inert>{children}</div><Footer /></>;
}
