import styles from "./Staff.module.css";

export default function StaffLoading() {
  return <p className={styles.staffCard} role="status">در حال دریافت اطلاعات کاربران سازمانی…</p>;
}
