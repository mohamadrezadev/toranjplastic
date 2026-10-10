import type { InputHTMLAttributes } from "react";
import { FieldSupport } from "./FieldSupport";
import { useFieldMetadata } from "./field-utils";
import styles from "./Field.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
}

export function Input({ label, helpText, error, id, required, className, ...props }: InputProps) {
  const meta = useFieldMetadata(id, helpText, error);
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={meta.controlId}>{label}{required ? <span className={styles.required} aria-hidden="true"> *</span> : null}</label>
      <input {...props} id={meta.controlId} required={required} className={[styles.control, className].filter(Boolean).join(" ")} aria-describedby={meta.describedBy} aria-invalid={Boolean(error) || undefined} />
      <FieldSupport {...meta} helpText={helpText} error={error} />
    </div>
  );
}
