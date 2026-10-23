import type { CategoryCount } from "@src/features/exhibition/categories";
import styles from "./FallbackPoster.module.css";

interface FallbackPosterProps {
  year: number;
  date: string;
  hour: string;
  counts: CategoryCount[];
  total: number;
}

/** 포스터가 등록되기 전 보여주는 기본 포스터. 분야별 작품 수 막대와 크게 잘린 연도로 만든다. */
export const FallbackPoster = ({ year, date, hour, counts, total }: FallbackPosterProps) => (
  <div className={styles.poster} role="img" aria-label={`${year} 졸업작품전 기본 포스터`}>
    <div className={styles.head}>
      <span className={styles.title}>
        성결대학교
        <br />
        컴퓨터공학과
        <br />
        졸업작품전
      </span>
      <span className={styles.when}>
        {date}
        <br />
        {hour}
      </span>
    </div>
    {total > 0 && (
      <div className={styles.bars} aria-hidden="true">
        {counts.map((c, i) => (
          <div key={c.category} className={styles.row}>
            <span>{c.label}</span>
            <span className={styles.bar} style={{ width: `${Math.round((c.count / total) * 100)}%`, animationDelay: `${300 + i * 120}ms` }} />
            <span className={styles.count}>{c.count}</span>
          </div>
        ))}
      </div>
    )}
    <span className={styles.year} aria-hidden="true">
      {year}
    </span>
  </div>
);
