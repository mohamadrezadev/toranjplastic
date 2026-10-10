import { useId } from "react";

export function useFieldMetadata(id: string | undefined, helpText?: string, error?: string) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const helpId = helpText ? `${controlId}-help` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return { controlId, helpId, errorId, describedBy };
}
