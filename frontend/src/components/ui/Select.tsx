import type { SelectHTMLAttributes } from "react";
import { FieldSupport } from "./FieldSupport";
import { useFieldMetadata } from "./field-utils";
import styles from "./Field.module.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; helpText?: string; error?: string; }

export function Select({ label, helpText, error, id, required, className, children, ...props }: SelectProps) {
  const meta = useFieldMetadata(id, helpText, error);
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={meta.controlId}>{label}{required ? <span className={styles.required} aria-hidden="true"> *</span> : null}</label>
    <select {...props} id={meta.controlId} required={required} className={[styles.control, className].filter(Boolean).join(" ")} aria-describedby={meta.describedBy} aria-invalid={Boolean(error) || undefined}>{children}</select>
    <FieldSupport {...meta} helpText={helpText} error={error} />
  </div>;
}
