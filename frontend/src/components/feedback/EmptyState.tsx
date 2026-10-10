import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import styles from "./Feedback.module.css";

type EmptyAction = { label: string; href: `/${string}` } | { label: string; onAction: () => void };

function isSafePath(path: string) { return path.startsWith("/") && !path.includes("#") && !path.startsWith("//"); }

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: EmptyAction; icon?: ReactNode }) {
  const validAction = action && ("onAction" in action || isSafePath(action.href)) ? action : undefined;
  return <section className={styles.empty} aria-labelledby="empty-state-title">
    {icon ? <span aria-hidden="true">{icon}</span> : null}
    <h2 id="empty-state-title">{title}</h2>
    <p>{description}</p>
    {validAction && "href" in validAction ? <Link className={styles.action} href={validAction.href}>{validAction.label}</Link> : null}
    {validAction && "onAction" in validAction ? <Button onClick={validAction.onAction}>{validAction.label}</Button> : null}
  </section>;
}
