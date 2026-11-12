"use client";

import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Switch as AstryxSwitch } from "@astryxdesign/core/Switch";
import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";
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

export function Radio(props: ChoiceProps) { return <Choice {...props} type="radio" />; }

export function Checkbox({
  label,
  helpText,
  error,
  checked,
  defaultChecked,
  onChange,
  disabled,
  readOnly,
  required,
  name,
  id,
  className,
}: ChoiceProps) {
  const [internalValue, setInternalValue] = useState(Boolean(defaultChecked));
  const resolvedValue = checked === undefined ? internalValue : checked;

  function handleChange(nextValue: boolean, event: ChangeEvent<HTMLInputElement>) {
    if (checked === undefined) setInternalValue(nextValue);
    onChange?.(event);
  }

  return <CheckboxInput
    {...{ required }}
    id={id}
    label={label}
    description={helpText}
    status={error ? { type: "error", message: error } : undefined}
    value={resolvedValue}
    onChange={handleChange}
    isDisabled={disabled}
    isReadOnly={readOnly}
    isRequired={required}
    htmlName={name}
    className={className}
  />;
}

export function Switch({
  label,
  helpText,
  error,
  checked,
  defaultChecked,
  onChange,
  disabled,
  required,
  name,
  id,
  className,
}: ChoiceProps) {
  const [internalValue, setInternalValue] = useState(Boolean(defaultChecked));
  const resolvedValue = checked === undefined ? internalValue : checked;

  function handleChange(nextValue: boolean, event: ChangeEvent<HTMLInputElement>) {
    if (checked === undefined) setInternalValue(nextValue);
    onChange?.(event);
  }

  return <AstryxSwitch
    {...{ required }}
    id={id}
    label={label}
    description={helpText}
    status={error ? { type: "error", message: error } : undefined}
    value={resolvedValue}
    onChange={handleChange}
    isDisabled={disabled}
    isRequired={required}
    htmlName={name}
    className={className}
  />;
}
