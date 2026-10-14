import styles from "./Inquiry.module.css";
export default function AdminInquiriesLoading() { return <div className={styles.page} role="status" aria-label="در حال بارگذاری کارتابل"><div className={styles.skeleton} /><div className={styles.summaryGrid}>{Array.from({ length: 4 }, (_, index) => <div className={styles.skeleton} key={index} />)}</div><div className={styles.skeleton} /></div>; }
