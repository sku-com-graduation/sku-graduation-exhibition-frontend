import { Link } from "react-router-dom";
import { Icon } from "@components/site/Icon";
import { getCurrentYear } from "@src/lib/exhibition";
import styles from "./NotFound.module.css";

/** 없는 주소, 잘못된 연도(2023 미만·미래·숫자 아님)에서 보여준다. */
const NotFound = () => {
  const year = getCurrentYear();
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.text}>요청한 페이지를 찾을 수 없습니다.</p>
        <Link className={styles.button} to={`/${year}`}>
          <Icon name="home" size={18} />
          {year} 전시 홈으로
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
