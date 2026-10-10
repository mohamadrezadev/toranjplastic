import type { TextareaHTMLAttributes } from "react";
import { FieldSupport } from "./FieldSupport";
import { useFieldMetadata } from "./field-utils";
import styles from "./Field.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; helpText?: string; error?: string; }

export function Textarea({ label, helpText, error, id, required, className, ...props }: TextareaProps) {
  const meta = useFieldMetadata(id, helpText, error);
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={meta.controlId}>{label}{required ? <span className={styles.required} aria-hidden="true"> *</span> : null}</label>
    <textarea {...props} id={meta.controlId} required={required} className={[styles.control, styles.textarea, className].filter(Boolean).join(" ")} aria-describedby={meta.describedBy} aria-invalid={Boolean(error) || undefined} />
    <FieldSupport {...meta} helpText={helpText} error={error} />
  </div>;
}
