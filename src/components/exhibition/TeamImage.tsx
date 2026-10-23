import { categoryLabel } from "@src/features/exhibition/categories";
import styles from "./TeamImage.module.css";

interface TeamImageProps {
  src: string | null | undefined;
  teamName: string;
  category: string;
  /** 장식용이면 빈 alt로 둔다 (제목이 바로 옆에 있는 카드 등) */
  alt?: string;
  className?: string;
}

/** 팀 대표 이미지. 없으면 팀명을 크게 쓴 기본 이미지로 대신한다. */
export const TeamImage = ({ src, teamName, category, alt = "", className }: TeamImageProps) =>
  src ? (
    <img className={`${styles.image} ${className ?? ""}`} src={src} alt={alt} loading="lazy" decoding="async" />
  ) : (
    <div className={`${styles.fallback} ${className ?? ""}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      <span className={styles.category}>{categoryLabel(category)}</span>
      <span className={styles.team}>{teamName}</span>
    </div>
  );
