import { useEffect, useRef } from "react";
import { Icon } from "@components/site/Icon";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  images: string[];
  /** 열려 있는 이미지 번호. null이면 닫힌 상태 */
  index: number | null;
  label: string;
  onChange: (index: number | null) => void;
}

/** 이미지를 화면 가득 크게 보는 창. 좌우 화살표 키로 넘기고 ESC나 바깥을 누르면 닫힌다. */
export const Lightbox = ({ images, index, label, onChange }: LightboxProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const many = images.length > 1;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const go = (step: number) => index !== null && onChange((index + step + images.length) % images.length);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={label}
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      {index !== null && (
        <>
          <img className={styles.image} src={images[index]} alt={many ? `${label} ${index + 1} / ${images.length}` : label} />
          <button type="button" className={styles.close} aria-label="닫기" onClick={() => onChange(null)}>
            <Icon name="close" size={20} />
          </button>
          {many && (
            <>
              <button type="button" className={`${styles.nav} ${styles.prev}`} aria-label="이전 이미지" onClick={() => go(-1)}>
                <Icon name="arrowLeft" size={20} />
              </button>
              <button type="button" className={`${styles.nav} ${styles.next}`} aria-label="다음 이미지" onClick={() => go(1)}>
                <Icon name="arrowRight" size={20} />
              </button>
              <span className={styles.count}>
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </>
      )}
    </dialog>
  );
};
