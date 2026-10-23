import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Dialog } from "@components/kit/Dialog";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import type { IStudentResponseInfo } from "@interface";
import { adminApi, adminKeys } from "../adminApi";
import { downloadCsv, isStudentNumber, readCsv, withoutHeader } from "../csv";
import { DataTable, SelectCell } from "../DataTable";
import { DirtyBar, Legend, notify, Search, SelectionBar, TabHead, type TabProps } from "../parts";
import { useDraft } from "../useDraft";
import styles from "../admin.module.css";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "MEMBER" },
  { value: "LEADER", label: "LEADER" },
];

const idOf = (s: IStudentResponseInfo) => s.encryptedStudentId;

export const StudentsTab = ({ year, onDirtyChange }: TabProps) => {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: adminKeys.students(year), queryFn: () => adminApi.students(year) });
  const students = useMemo(() => data?.students ?? [], [data]);
  const teams = useMemo(() => data?.teams ?? [], [data]);
  const draft = useDraft(students, idOf);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const teamOptions = useMemo(() => [{ value: "", label: "선택 안 함" }, ...teams.map((t) => ({ value: t.encryptedTeamId, label: t.teamName }))], [teams]);
  const teamName = useCallback((id: string | null) => teams.find((t) => t.encryptedTeamId === id)?.teamName ?? "", [teams]);

  // 검색이 팀 이름으로도 되도록 팀명을 함께 담은 행으로 보여준다
  const rows = useMemo(() => draft.view.map((s) => ({ ...s, teamName: teamName(s.encryptedTeamId) })), [draft.view, teamName]);
  type Row = (typeof rows)[number];

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      { accessorKey: "name", header: "이름", cell: ({ getValue }) => <span className={styles.strong}>{getValue() as string}</span> },
      { accessorKey: "studentNumber", header: "학번", cell: ({ getValue }) => <span className={styles.mono}>{getValue() as string}</span> },
      {
        accessorKey: "teamName",
        header: "팀",
        cell: ({ row }) => (
          <SelectCell
            label={`${row.original.name} 팀`}
            value={row.original.encryptedTeamId ?? ""}
            options={teamOptions}
            onChange={(v) => draft.update(row.id, { encryptedTeamId: v || null })}
          />
        ),
      },
      {
        accessorKey: "role",
        header: "역할",
        size: 140,
        cell: ({ row }) => <SelectCell label={`${row.original.name} 역할`} value={row.original.role} options={ROLE_OPTIONS} onChange={(v) => draft.update(row.id, { role: v })} />,
      },
      { accessorKey: "exhibitionYear", header: "전시연도", size: 100, cell: ({ getValue }) => <span className={styles.mono}>{getValue() as string}</span> },
    ],
    [teamOptions, draft],
  );

  const selectedIds = Object.keys(selection).filter((id) => selection[id]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateStudents(
        draft.changed.map((s) => ({
          encryptedStudentId: s.encryptedStudentId,
          encryptedTeamId: s.encryptedTeamId || null,
          name: s.name,
          studentNumber: s.studentNumber,
          role: s.role,
          exhibitionYear: s.exhibitionYear || String(year),
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
    if (students.some((s) => selectedIds.includes(s.encryptedStudentId) && s.encryptedTeamId)) {
      notify.info("팀에 소속된 학생은 삭제할 수 없습니다. 먼저 팀을 '선택 안 함'으로 바꿔 저장하세요.");
      return;
    }
    if (!window.confirm(`${selectedIds.length}명 학생을 삭제하시겠습니까?`)) return;
    try {
      await adminApi.deleteStudents(selectedIds);
      setSelection({});
      draft.reset();
      await refetch();
      notify.ok("학생을 삭제했습니다.");
    } catch {
      notify.error("학생을 삭제하지 못했습니다.");
    }
  };

  return (
    <>
      <TabHead year={year} crumb="학생" title="학생 관리">
        <Search value={search} onChange={setSearch} placeholder="이름, 학번 또는 팀" />
        <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={() => setAdding(true)}>
          <Icon name="plus" />
          학생 추가
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
        empty={isError ? "학생 목록을 불러오지 못했습니다." : `${year}년에 등록된 학생이 없습니다. 오른쪽 위 '학생 추가'로 등록하세요.`}
      />
      <p className={styles.note}>팀에 소속된 학생은 삭제할 수 없습니다. 팀장(LEADER)은 팀마다 한 명입니다.</p>
      <SelectionBar count={selectedIds.length} onClear={() => setSelection({})}>
        <button type="button" className={`${kit.btn} ${kit.small} ${styles.barDanger}`} onClick={remove}>
          <Icon name="trash" />
          삭제
        </button>
      </SelectionBar>
      <DirtyBar count={draft.changed.length} saving={saving} onReset={draft.reset} onSave={save} onDirtyChange={onDirtyChange} />
      <StudentImportDialog
        open={adding}
        existing={students.map((s) => s.studentNumber)}
        onClose={() => setAdding(false)}
        onDone={async () => {
          setAdding(false);
          await queryClient.invalidateQueries({ queryKey: ["admin"] });
        }}
      />
    </>
  );
};

interface Draft {
  studentName: string;
  studentNumber: string;
}

const problemOf = (row: Draft, all: Draft[], existing: string[]) => {
  if (!row.studentName) return "이름이 비어 있습니다";
  if (!isStudentNumber(row.studentNumber)) return "학번은 숫자 6~12자리입니다";
  if (existing.includes(row.studentNumber)) return "이미 등록된 학번입니다";
  if (all.filter((r) => r.studentNumber === row.studentNumber).length > 1) return "목록 안에 같은 학번이 있습니다";
  return null;
};

/** 학생 추가: CSV(이름, 학번) 또는 직접 입력 → 검토 → 등록 */
const StudentImportDialog = ({ open, existing, onClose, onDone }: { open: boolean; existing: string[]; onClose: () => void; onDone: () => void }) => {
  const [rows, setRows] = useState<Draft[]>([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [over, setOver] = useState(false);
  const [sending, setSending] = useState(false);

  const close = () => {
    setRows([]);
    setName("");
    setNumber("");
    onClose();
  };

  const load = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = withoutHeader(await readCsv(file), 1).map(([studentName = "", studentNumber = ""]) => ({ studentName, studentNumber }));
      if (parsed.length === 0) notify.info("파일에 학생이 없습니다.");
      setRows((r) => [...r, ...parsed]);
    } catch {
      notify.error("CSV 파일을 읽지 못했습니다. UTF-8 형식인지 확인하세요.");
    }
  };

  const problems = rows.map((r) => problemOf(r, rows, existing));
  const bad = problems.filter(Boolean).length;

  const submit = async () => {
    setSending(true);
    try {
      await adminApi.addStudents(rows);
      notify.ok(`${rows.length}명을 등록했습니다.`);
      setRows([]);
      onDone();
    } catch {
      notify.error("등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="학생 추가"
      description="CSV 파일(이름, 학번)을 올리거나 한 명씩 입력합니다. 등록 전에 목록을 확인하세요."
      onClose={close}
      width={720}
      locked={sending}
      footer={
        <>
          <span className={styles.summary} style={{ marginRight: "auto" }}>
            {rows.length > 0 && (
              <>
                <span className={styles.badge} data-tone="ok">
                  정상 {rows.length - bad}
                </span>
                {bad > 0 && (
                  <span className={styles.badge} data-tone="warn">
                    수정 필요 {bad}
                  </span>
                )}
              </>
            )}
          </span>
          <button type="button" className={kit.btn} onClick={close} disabled={sending}>
            취소
          </button>
          <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={submit} disabled={rows.length === 0 || bad > 0 || sending}>
            <Icon name="check" />
            {sending ? "등록 중" : `${rows.length}명 등록`}
          </button>
        </>
      }
    >
      <label
        className={styles.drop}
        data-over={over || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          load(e.dataTransfer.files[0]);
        }}
      >
        <Icon name="upload" size={22} />
        CSV 파일을 눌러서 고르거나 끌어다 놓으세요
        <span className={kit.help}>첫 줄이 제목 줄이면 자동으로 건너뜁니다</span>
        <input
          className="visually-hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            load(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <button type="button" className={`${kit.btn} ${kit.small} ${kit.ghost}`} style={{ alignSelf: "flex-start" }} onClick={() => downloadCsv("학생_양식.csv", [["이름", "학번"], ["홍길동", "2023000001"]])}>
        <Icon name="download" />
        양식 받기
      </button>

      <form
        className={styles.manual}
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !number.trim()) {
            notify.info(!name.trim() ? "이름을 입력하세요." : "학번을 입력하세요.");
            return;
          }
          setRows((r) => [...r, { studentName: name.trim(), studentNumber: number.trim() }]);
          setName("");
          setNumber("");
        }}
      >
        <div className={styles.manualRow}>
          <label className={kit.field}>
            이름
            <input className={kit.input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={kit.field}>
            학번
            <input className={kit.input} inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <button type="submit" className={kit.btn}>
            <Icon name="plus" />
            목록에 추가
          </button>
        </div>
      </form>

      {rows.length > 0 && (
        <div className={styles.previewWrap}>
          <table className={styles.plainTable}>
            <thead>
              <tr>
                <th>이름</th>
                <th>학번</th>
                <th>상태</th>
                <th>
                  <span className="visually-hidden">빼기</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.studentName || <span className={styles.muted}>비어 있음</span>}</td>
                  <td className={styles.mono}>{r.studentNumber}</td>
                  <td>{problems[i] ? <span className={styles.rowError}>{problems[i]}</span> : <span className={styles.badge} data-tone="ok">정상</span>}</td>
                  <td>
                    <button type="button" className={`${kit.btn} ${kit.small} ${kit.ghost}`} aria-label={`${r.studentName} 빼기`} onClick={() => setRows((list) => list.filter((_, j) => j !== i))}>
                      <Icon name="close" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Dialog>
  );
};
