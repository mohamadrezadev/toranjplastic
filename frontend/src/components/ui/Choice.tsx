import type { InputHTMLAttributes } from "react";
import { FieldSupport } from "./FieldSupport";
import { useFieldMetadata } from "./field-utils";
import styles from "./Field.module.css";

type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> & { label: string; helpText?: string; error?: string };

function Choice({ type, role, label, helpText, error, id, className, ...props }: ChoiceProps & { type: "checkbox" | "radio"; role?: "switch" }) {
  const meta = useFieldMetadata(id, helpText, error);
  return <div className={styles.field}>
    <label className={[styles.choice, role === "switch" ? styles.switch : undefined, className].filter(Boolean).join(" ")}>
      <input {...props} id={meta.controlId} type={type} role={role} aria-describedby={meta.describedBy} aria-invalid={Boolean(error) || undefined} />
      <span>{label}</span>
    </label>
    <FieldSupport {...meta} helpText={helpText} error={error} />
  </div>;
}

export function Checkbox(props: ChoiceProps) { return <Choice {...props} type="checkbox" />; }
export function Radio(props: ChoiceProps) { return <Choice {...props} type="radio" />; }
export function Switch(props: ChoiceProps) { return <Choice {...props} type="checkbox" role="switch" />; }
