import { getCurrentYear } from "@src/lib/exhibition";
import styles from "./SiteFooter.module.css";

export const SiteFooter = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <span>© {getCurrentYear()} 성결대학교 컴퓨터공학과</span>
      <a href="https://www.sungkyul.ac.kr/computer/index.do" target="_blank" rel="noopener noreferrer">
        학과 홈페이지
      </a>
    </div>
  </footer>
);
