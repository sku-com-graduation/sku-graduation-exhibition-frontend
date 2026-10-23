import { useEffect, type ReactNode } from "react";
import { toast } from "react-toastify";
import { Icon } from "@components/site/Icon";
import kit from "@components/kit/kit.module.css";
import type { AdminTab } from "@src/pages/AdminPage";
import styles from "./admin.module.css";

export interface TabProps {
  year: number;
  onDirtyChange: (dirty: boolean) => void;
  go: (tab: AdminTab) => void;
}

export const notify = {
  ok: (message: string) => toast.success(message, { position: "top-center", autoClose: 2500 }),
  info: (message: string) => toast.info(message, { position: "top-center", autoClose: 3500 }),
  error: (message: string) => toast.error(message, { position: "top-center", autoClose: 5000 }),
};

/** 탭 제목 줄: 위치, 제목, 검색과 버튼들 */
export const TabHead = ({ year, crumb, title, children }: { year: number; crumb: string; title: string; children?: ReactNode }) => (
  <div className={styles.mainHead}>
    <div>
      <span className={styles.crumb}>
        {year} / {crumb}
      </span>
      <h1>{title}</h1>
    </div>
    {children && <div className={styles.tools}>{children}</div>}
  </div>
);

export const Search = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <label className={styles.search}>
    <Icon name="search" />
    <input type="search" aria-label="표 안에서 검색" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

export const Legend = ({ count, editable = true }: { count: number; editable?: boolean }) => (
  <div className={styles.legend}>
    <span>{count}개 행</span>
    {editable && (
      <>
        <span>
          <i className={styles.legendEdit} />
          점선 = 눌러서 바로 수정
        </span>
        <span>
          <i className={styles.legendChanged} />
          수정됨 (저장 전)
        </span>
      </>
    )}
  </div>
);

/** 선택한 행에 대한 작업 막대 */
export const SelectionBar = ({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) =>
  count > 0 ? (
    <div className={styles.selectionBar} role="region" aria-label="선택한 항목 작업">
      <span>{count}개 선택</span>
      {children}
      <button type="button" className={`${kit.btn} ${kit.small} ${kit.icon}`} aria-label="선택 해제" onClick={onClear}>
        <Icon name="close" />
      </button>
    </div>
  ) : null;

/** 저장하지 않은 변경 막대. 탭 전환 확인을 위해 상위에 변경 여부를 알린다 */
export const DirtyBar = ({
  count,
  saving,
  onReset,
  onSave,
  onDirtyChange,
}: {
  count: number;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) => {
  useEffect(() => {
    onDirtyChange(count > 0);
    return () => onDirtyChange(false);
  }, [count, onDirtyChange]);

  if (count === 0) return null;
  return (
    <div className={kit.bar} role="region" aria-label="저장하지 않은 변경">
      <span className={kit.barText}>
        <span className={kit.dot} />
        저장하지 않은 변경 {count}건 · 다른 탭이나 페이지로 가면 확인합니다
      </span>
      <span className={kit.barActions}>
        <button type="button" className={`${kit.btn} ${kit.ghost}`} onClick={onReset} disabled={saving}>
          <Icon name="reset" />
          되돌리기
        </button>
        <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={onSave} disabled={saving}>
          <Icon name="save" />
          {saving ? "저장 중" : "저장"}
        </button>
      </span>
    </div>
  );
};
