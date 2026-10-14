"use client";
import { Button } from "@/components/ui";
import styles from "./Inquiry.module.css";
export default function AdminInquiriesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <section className={styles.panel} role="alert"><h1>کارتابل در دسترس نیست</h1><p className={styles.lead}>دریافت اطلاعات استعلام‌ها با خطا مواجه شد. اطلاعات حساس نمایش داده نشده است.</p><div className={styles.actionList}><Button type="button" onClick={reset}>تلاش دوباره</Button></div></section>; }
