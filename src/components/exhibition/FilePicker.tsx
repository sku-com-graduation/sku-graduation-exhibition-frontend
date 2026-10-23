import { useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "@components/site/Icon";
import styles from "./FilePicker.module.css";

interface FilePickerProps {
  label: string;
  /** input accept 값 */
  accept: string;
  hint: string;
  /** 고른 파일을 검사한다. 문제가 있으면 안내 문구를 돌려준다 */
  validate?: (file: File) => string | null;
  onPick: (file: File) => void;
  onRemove?: () => void;
  onError: (message: string) => void;
  /** 미리보기. 없으면 빈 칸(끌어 놓기 안내)을 보여준다 */
  preview?: ReactNode;
  ratio?: string;
}

/** 눌러서 고르거나 끌어다 놓는 파일 칸. 미리보기가 있으면 바꾸기·삭제 버튼을 붙인다. */
export const FilePicker = ({ label, accept, hint, validate, onPick, onRemove, onError, preview, ratio = "1 / 1" }: FilePickerProps) => {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [over, setOver] = useState(false);

  const take = (file: File | undefined) => {
    if (!file) return;
    const problem = validate?.(file);
    if (problem) onError(problem);
    else onPick(file);
  };

  return (
    <div className={styles.wrap}>
      <div
        className={styles.zone}
        data-over={over || undefined}
        data-filled={!!preview || undefined}
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files[0]);
        }}
      >
        {preview ?? (
          <button type="button" className={styles.empty} onClick={() => input.current?.click()} aria-describedby={`${id}-hint`}>
            <Icon name="plus" size={22} />
            <span>{label} 추가</span>
            <small>눌러서 고르거나 끌어다 놓으세요</small>
          </button>
        )}
      </div>
      <div className={styles.foot}>
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
        {preview && (
          <span className={styles.actions}>
            <button type="button" className={styles.action} onClick={() => input.current?.click()}>
              <Icon name="reset" size={14} />
              바꾸기
            </button>
            {onRemove && (
              <button type="button" className={`${styles.action} ${styles.danger}`} onClick={onRemove}>
                <Icon name="trash" size={14} />
                삭제
              </button>
            )}
          </span>
        )}
      </div>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept={accept}
        aria-label={`${label} 파일 선택`}
        tabIndex={-1}
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
};
