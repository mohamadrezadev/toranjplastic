"use client";

import { TextArea } from "@astryxdesign/core/TextArea";
import { useState, type ChangeEvent, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; helpText?: string; error?: string; }

function textValue(value: TextareaProps["value"] | TextareaProps["defaultValue"]): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function Textarea({
  label,
  helpText,
  error,
  id,
  required,
  className,
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
  maxLength,
  rows,
  dir,
  onBlur,
  onFocus,
}: TextareaProps) {
  const [internalValue, setInternalValue] = useState(() => textValue(defaultValue));
  const resolvedValue = value === undefined ? internalValue : textValue(value);

  function handleChange(nextValue: string, event: ChangeEvent<HTMLTextAreaElement>) {
    if (maxLength !== undefined && nextValue.length > maxLength) return;
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(event);
  }

  return <TextArea
    {...{ required }}
    id={id}
    label={label}
    description={helpText}
    status={error ? { type: "error", message: error } : undefined}
    statusVariant="detached"
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
    maxLength={maxLength}
    rows={rows}
    dir={dir}
    onBlur={onBlur}
    onFocus={onFocus}
    containerClassName={className}
  />;
}
