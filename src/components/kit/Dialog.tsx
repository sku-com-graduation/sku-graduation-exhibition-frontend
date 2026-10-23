import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@components/site/Icon";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** 아래쪽 버튼 줄 */
  footer?: ReactNode;
  width?: number;
  /** 저장 중처럼 닫으면 안 될 때 */
  locked?: boolean;
}

/** 네이티브 dialog. 포커스 가두기와 ESC 닫기를 브라우저에 맡긴다. */
export const Dialog = ({ open, title, description, onClose, children, footer, width = 480, locked }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (!locked) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !locked) onClose();
      }}
    >
      {open && (
        <div className={styles.body}>
          <div className={styles.head}>
            <h2>{title}</h2>
            <button type="button" className={styles.close} aria-label="닫기" onClick={onClose} disabled={locked}>
              <Icon name="close" size={20} />
            </button>
          </div>
          {description && <p className={styles.desc}>{description}</p>}
          {children}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
};
