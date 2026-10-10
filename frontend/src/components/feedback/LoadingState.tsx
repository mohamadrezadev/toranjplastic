import styles from "./Feedback.module.css";

export function LoadingState({ label = "در حال بارگذاری…" }: { label?: string }) {
  return <div className={styles.loading} role="status" aria-live="polite" aria-busy="true">
    <div><span className={styles.spinner} aria-hidden="true" /><p>{label}</p></div>
  </div>;
}
