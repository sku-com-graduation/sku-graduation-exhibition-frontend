import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import { CATEGORY_ORDER, categoryLabel } from "@src/features/exhibition/categories";
import type { ITeamData } from "@interface";
import { adminApi, adminKeys } from "../adminApi";
import { DataTable, SelectCell, TextCell } from "../DataTable";
import { DirtyBar, Legend, notify, Search, SelectionBar, TabHead, type TabProps } from "../parts";
import { useDraft } from "../useDraft";
import styles from "../admin.module.css";

const CATEGORY_OPTIONS = CATEGORY_ORDER.map((c) => ({ value: c, label: `${categoryLabel(c)} (${c})` }));
const idOf = (t: ITeamData) => t.encryptedTeamId;

export const TeamsTab = ({ year, onDirtyChange, go }: TabProps) => {
  const { data, isPending, isError, refetch } = useQuery({ queryKey: adminKeys.teams(year), queryFn: () => adminApi.teams(year) });
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const professors = useMemo(() => data?.professors ?? [], [data]);
  const draft = useDraft(teams, idOf);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [saving, setSaving] = useState(false);

  const professorOptions = useMemo(() => {
    const list = professors.map((p) => ({ value: p.encryptedProfessorId, label: p.professorName }));
    return [{ value: "", label: "선택 안 함" }, ...list];
  }, [professors]);

  const rows = useMemo(
    () => draft.view.map((t) => ({ ...t, professorName: professors.find((p) => p.encryptedProfessorId === t.encryptedProfessorId)?.professorName ?? "" })),
    [draft.view, professors],
  );
  type Row = (typeof rows)[number];

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "팀명",
        cell: ({ row }) => <TextCell label="팀명" value={row.original.name} onChange={(v) => draft.update(row.id, { name: v })} />,
      },
      {
        accessorKey: "professorName",
        header: "지도교수",
        cell: ({ row }) => (
          <SelectCell
            label={`${row.original.name} 지도교수`}
            value={row.original.encryptedProfessorId ?? ""}
            options={professorOptions}
            onChange={(v) => draft.update(row.id, { encryptedProfessorId: v })}
          />
        ),
      },
      {
        accessorKey: "category",
        header: "분야",
        size: 180,
        cell: ({ row }) => <SelectCell label={`${row.original.name} 분야`} value={row.original.category} options={CATEGORY_OPTIONS} onChange={(v) => draft.update(row.id, { category: v })} />,
      },
      { accessorKey: "exhibitionYear", header: "전시연도", size: 100, cell: ({ getValue }) => <span className={styles.mono}>{String(getValue())}</span> },
    ],
    [professorOptions, draft],
  );

  const selectedIds = Object.keys(selection).filter((id) => selection[id]);

  const save = async () => {
    if (draft.changed.some((t) => !t.name.trim())) {
      notify.info("팀명이 비어 있는 행이 있습니다.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateTeams(
        draft.changed.map((t) => ({
          encryptedTeamId: t.encryptedTeamId,
          encryptedProfessorId: t.encryptedProfessorId,
          name: t.name.trim(),
          exhibitionYear: Number(t.exhibitionYear) || year,
          category: t.category,
        })),
      );
      await refetch();
      draft.reset();
      notify.ok("저장했습니다.");
    } catch {
      notify.error("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`${selectedIds.length}개 팀을 삭제하시겠습니까?`)) return;
    try {
      await adminApi.deleteTeams(selectedIds);
      setSelection({});
      draft.reset();
      await refetch();
      notify.ok("팀을 삭제했습니다.");
    } catch {
      notify.error("팀을 삭제하지 못했습니다.");
    }
  };

  return (
    <>
      <TabHead year={year} crumb="팀" title="팀 관리">
        <Search value={search} onChange={setSearch} placeholder="팀명 또는 교수" />
        <button type="button" className={kit.btn} onClick={() => go("accounts")}>
          <Icon name="key" />
          계정 발급으로 팀 만들기
        </button>
      </TabHead>
      <Legend count={rows.length} />
      <DataTable
        data={rows}
        columns={columns}
        getRowId={idOf}
        search={search}
        selection={selection}
        onSelectionChange={setSelection}
        changedIds={draft.changedIds}
        loading={isPending}
        rowLabel={(r) => r.name}
        empty={isError ? "팀 목록을 불러오지 못했습니다." : `${year}년 팀이 없습니다. 팀은 계정을 발급할 때 함께 만들어집니다.`}
      />
      <p className={styles.note}>
        팀은 계정 발급 때 만들어집니다. 작품 내용은 팀 계정이나 관리자가 <Link to={`/${year}/project`}>작품 화면</Link>에서 수정합니다.
      </p>
      <SelectionBar count={selectedIds.length} onClear={() => setSelection({})}>
        <button type="button" className={`${kit.btn} ${kit.small} ${styles.barDanger}`} onClick={remove}>
          <Icon name="trash" />
          삭제
        </button>
      </SelectionBar>
      <DirtyBar count={draft.changed.length} saving={saving} onReset={draft.reset} onSave={save} onDirtyChange={onDirtyChange} />
    </>
  );
};
