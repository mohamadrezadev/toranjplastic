"use client";

import { TextInput } from "@astryxdesign/core/TextInput";
import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { FieldSupport } from "./FieldSupport";
import { useFieldMetadata } from "./field-utils";
import styles from "./Field.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
}

type AstryxTextType = "text" | "password" | "email" | "search" | "tel" | "url";

function supportsAstryx(type: InputHTMLAttributes<HTMLInputElement>["type"]): type is AstryxTextType | undefined {
  return type === undefined || ["text", "password", "email", "search", "tel", "url"].includes(type);
}

function textValue(value: InputProps["value"] | InputProps["defaultValue"]): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function Input({
  label,
  helpText,
  error,
  id,
  required,
  className,
  type,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  readOnly,
  placeholder,
  autoComplete,
  autoFocus,
  spellCheck,
  inputMode,
  minLength,
  maxLength,
  pattern,
  dir,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: InputProps) {
  const meta = useFieldMetadata(id, helpText, error);

  if (!supportsAstryx(type)) {
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={meta.controlId}>{label}{required ? <span className={styles.required} aria-hidden="true"> *</span> : null}</label>
        <input
          {...props}
          id={meta.controlId}
          type={type}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
          inputMode={inputMode}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          dir={dir}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className={[styles.control, className].filter(Boolean).join(" ")}
          aria-describedby={meta.describedBy}
          aria-invalid={Boolean(error) || undefined}
        />
        <FieldSupport {...meta} helpText={helpText} error={error} />
      </div>
    );
  }

  return <AstryxTextInputAdapter
    label={label}
    helpText={helpText}
    error={error}
    id={meta.controlId}
    required={required}
    className={className}
    type={type}
    name={name}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    disabled={disabled}
    readOnly={readOnly}
    placeholder={placeholder}
    autoComplete={autoComplete}
    autoFocus={autoFocus}
    spellCheck={spellCheck}
    inputMode={inputMode}
    minLength={minLength}
    maxLength={maxLength}
    pattern={pattern}
    dir={dir}
    onBlur={onBlur}
    onFocus={onFocus}
    onKeyDown={onKeyDown}
  />;
}

function AstryxTextInputAdapter({
  label,
  helpText,
  error,
  id,
  required,
  className,
  type,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  readOnly,
  placeholder,
  autoComplete,
  autoFocus,
  spellCheck,
  inputMode,
  minLength,
  maxLength,
  pattern,
  dir,
  onBlur,
  onFocus,
  onKeyDown,
}: InputProps & { type?: AstryxTextType }) {
  const [internalValue, setInternalValue] = useState(() => textValue(defaultValue));
  const resolvedValue = value === undefined ? internalValue : textValue(value);

  function handleChange(nextValue: string, event: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(event);
  }

  return (
    <TextInput
      {...{ required, minLength, maxLength, pattern }}
      id={id}
      label={label}
      description={helpText}
      status={error ? { type: "error", message: error } : undefined}
      statusVariant="detached"
      type={type}
      htmlName={name}
      value={resolvedValue}
      onChange={handleChange}
      isRequired={required}
      isDisabled={disabled}
      isReadOnly={readOnly}
      placeholder={placeholder}
      autoComplete={autoComplete}
      hasAutoFocus={autoFocus}
      hasSpellCheck={typeof spellCheck === "boolean" ? spellCheck : undefined}
      inputMode={inputMode}
      dir={dir}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      containerClassName={className}
    />
  );
}
