import { useEffect, useId, useRef, useState } from "react";
import { getCurrentYear, getExhibitionYears, themeOf } from "@src/lib/exhibition";
import { Icon } from "./Icon";
import styles from "./YearSelect.module.css";

interface YearSelectProps {
  value: number;
  onChange: (year: number) => void;
  /** 목록을 버튼 왼쪽 끝에 맞출지(사이드바) 오른쪽 끝에 맞출지(헤더) */
  align?: "left" | "right";
}

export const YearSelect = ({ value, onChange, align = "right" }: YearSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const years = getExhibitionYears();
  const current = getCurrentYear();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`전시 연도 선택, 현재 ${value}년`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.dot} style={{ background: themeOf(value).accent }} />
        <span className={styles.year}>{value}</span>
        <Icon name="chevronDown" size={14} strokeWidth={2} className={styles.chevron} />
      </button>
      {open && (
        <ul className={styles.list} data-align={align} id={listId} aria-label="전시 연도">
          {years.map((y) => (
            <li key={y}>
              <button
                type="button"
                className={styles.option}
                aria-pressed={y === value}
                onClick={() => {
                  setOpen(false);
                  if (y !== value) onChange(y);
                }}
              >
                <span className={styles.dot} style={{ background: themeOf(y).accent }} />
                <span className={styles.year}>{y}</span>
                <span className={styles.sub}>{y === current ? "진행 중" : ""}</span>
                {y === value && <Icon name="check" strokeWidth={2.25} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
