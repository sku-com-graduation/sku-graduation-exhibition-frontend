import { useCallback, useMemo, useState } from "react";

/**
 * 표에서 고친 내용을 저장 전까지 모아 둔다. 서버에서 받은 원래 행은 그대로 두고
 * 고친 행만 id별로 보관하며, 화면에는 둘을 합친 행을 보여준다.
 */
export const useDraft = <T>(rows: T[], getId: (row: T) => string) => {
  const [edits, setEdits] = useState<Map<string, T>>(new Map());

  const view = useMemo(() => rows.map((r) => edits.get(getId(r)) ?? r), [rows, edits, getId]);

  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      setEdits((prev) => {
        const base = prev.get(id) ?? rows.find((r) => getId(r) === id);
        if (!base) return prev;
        const next = new Map(prev);
        next.set(id, { ...base, ...patch });
        return next;
      }),
    [rows, getId],
  );

  const reset = useCallback(() => setEdits(new Map()), []);

  /** 원래 값과 실제로 달라진 행만 */
  const changed = useMemo(
    () =>
      [...edits.values()].filter((edited) => {
        const original = rows.find((r) => getId(r) === getId(edited));
        return !original || JSON.stringify(original) !== JSON.stringify(edited);
      }),
    [edits, rows, getId],
  );

  const changedIds = useMemo(() => new Set(changed.map(getId)), [changed, getId]);

  return { view, update, reset, changed, changedIds };
};
