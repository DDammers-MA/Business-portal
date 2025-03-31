import styles from "./page.module.scss";
import Projecten from "@/components/Projecten/projecten";

export default function Home() {
  return (

    <div className={styles.page}>
      <main className={styles.page__main}>
        <Projecten />
      </main>

    </div>
  );
}