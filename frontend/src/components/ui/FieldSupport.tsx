import styles from "./Field.module.css";

export function FieldSupport({ helpId, helpText, errorId, error }: { helpId?: string; helpText?: string; errorId?: string; error?: string }) {
  return (
    <>
      {helpText ? <span className={styles.help} id={helpId}>{helpText}</span> : null}
      {error ? <span className={styles.error} id={errorId}>{error}</span> : null}
    </>
  );
}
