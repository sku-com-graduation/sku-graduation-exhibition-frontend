import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Dialog } from "@components/kit/Dialog";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import { CATEGORY_LABEL, CATEGORY_ORDER, categoryLabel } from "@src/features/exhibition/categories";
import type { IAccountResponse, IAccountSetInfo, IAccountTeamRequest } from "@interface";
import { adminApi, adminKeys } from "../adminApi";
import { downloadCsv, isEmail, readCsv } from "../csv";
import { DataTable } from "../DataTable";
import { Legend, notify, Search, SelectionBar, TabHead, type TabProps } from "../parts";
import styles from "../admin.module.css";

const idOf = (a: IAccountResponse) => a.encryptedAccountId;

export const AccountsTab = ({ year }: TabProps) => {
  const queryClient = useQueryClient();
  const { data = [], isPending, isError, refetch } = useQuery({ queryKey: adminKeys.accounts(year), queryFn: () => adminApi.accounts(year) });
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [adding, setAdding] = useState(false);

  const columns = useMemo<ColumnDef<IAccountResponse, unknown>[]>(
    () => [
      { accessorKey: "teamName", header: "팀명", cell: ({ getValue }) => <span className={styles.strong}>{getValue() as string}</span> },
      { accessorKey: "userEmail", header: "계정 아이디", cell: ({ getValue }) => <span className={styles.mono}>{getValue() as string}</span> },
      {
        accessorKey: "recent",
        header: "최근 접속",
        size: 200,
        cell: ({ getValue }) => (getValue() ? <span className={styles.mono}>{getValue() as string}</span> : <span className={styles.muted}>접속 기록 없음</span>),
      },
    ],
    [],
  );

  const selectedIds = Object.keys(selection).filter((id) => selection[id]);

  const reset = async () => {
    if (!window.confirm(`${selectedIds.length}개 계정의 비밀번호를 처음 값(팀장 학번)으로 되돌릴까요?`)) return;
    try {
      await adminApi.resetAccounts(selectedIds);
      setSelection({});
      notify.ok("비밀번호를 초기화했습니다. 팀장 학번으로 로그인할 수 있습니다.");
    } catch {
      notify.error("비밀번호를 초기화하지 못했습니다.");
    }
  };

  const remove = async () => {
    if (!window.confirm(`${selectedIds.length}개 계정을 삭제하시겠습니까?`)) return;
    try {
      await adminApi.deleteAccounts(selectedIds);
      setSelection({});
      await refetch();
      notify.ok("계정을 삭제했습니다.");
    } catch {
      notify.error("계정을 삭제하지 못했습니다.");
    }
  };

  return (
    <>
      <TabHead year={year} crumb="계정" title="계정 관리">
        <Search value={search} onChange={setSearch} placeholder="팀명 또는 아이디" />
        <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={() => setAdding(true)}>
          <Icon name="plus" />
          계정 발급
        </button>
      </TabHead>
      <Legend count={data.length} editable={false} />
      <DataTable
        data={data}
        columns={columns}
        getRowId={idOf}
        search={search}
        selection={selection}
        onSelectionChange={setSelection}
        loading={isPending}
        rowLabel={(r) => r.teamName}
        empty={isError ? "계정 목록을 불러오지 못했습니다." : `${year}년에 발급한 계정이 없습니다.`}
      />
      <p className={styles.note}>계정 아이디는 팀장 이메일, 처음 비밀번호는 팀장 학번입니다. 계정을 발급하면 팀이 함께 만들어집니다.</p>
      <SelectionBar count={selectedIds.length} onClear={() => setSelection({})}>
        <button type="button" className={`${kit.btn} ${kit.small}`} onClick={reset}>
          <Icon name="reset" />
          비밀번호 초기화
        </button>
        <button type="button" className={`${kit.btn} ${kit.small} ${styles.barDanger}`} onClick={remove}>
          <Icon name="trash" />
          삭제
        </button>
      </SelectionBar>
      {adding && (
        <AccountImportDialog
          year={year}
          onClose={() => setAdding(false)}
          onDone={async () => {
            setAdding(false);
            await queryClient.invalidateQueries({ queryKey: ["admin"] });
          }}
        />
      )}
    </>
  );
};

/** 분야는 영문(WEB)·한글(웹)·소문자 모두 받는다 */
const normalizeCategory = (value: string) => {
  const upper = value.trim().toUpperCase();
  if ((CATEGORY_ORDER as readonly string[]).includes(upper)) return upper;
  return Object.entries(CATEGORY_LABEL).find(([, label]) => label === value.trim())?.[0] ?? value.trim();
};

const problemsOf = (team: IAccountTeamRequest, all: IAccountTeamRequest[], info: IAccountSetInfo) => {
  const out: string[] = [];
  if (!team.teamName) out.push("팀명이 비어 있습니다");
  else if (all.filter((t) => t.teamName === team.teamName).length > 1) out.push("같은 팀명이 두 번 있습니다");
  if (!(CATEGORY_ORDER as readonly string[]).includes(team.category)) out.push(`분야 '${team.category}'를 알 수 없습니다`);
  if (!info.professors.some((p) => p.professorName === team.professorName)) out.push(`교수 '${team.professorName || "비어 있음"}'가 교수 목록에 없습니다`);
  if (team.studentInfos.length === 0) out.push("학생이 없습니다");
  team.studentInfos.forEach((s, i) => {
    const known = info.students.find((k) => k.studentNumber === s.studentNumber);
    if (!known) out.push(`학번 ${s.studentNumber || "비어 있음"}: 팀이 없는 학생 목록에 없습니다`);
    else if (known.studentName !== s.studentName) out.push(`학번 ${s.studentNumber}의 이름은 ${known.studentName}입니다`);
    if (!isEmail(s.studentEmail)) out.push(`${s.studentName || `${i + 1}번째 학생`}: 이메일 형식이 아닙니다`);
    const used = all.flatMap((t) => t.studentInfos).filter((x) => x.studentNumber === s.studentNumber).length;
    if (s.studentNumber && used > 1) out.push(`학번 ${s.studentNumber}이 여러 팀에 있습니다`);
  });
  return out;
};

/** CSV 한 줄: 팀명, 분야, 지도교수, (학생 이름, 학번, 이메일) × N. 첫 학생이 팀장 */
const parseTeams = (rows: string[][]): IAccountTeamRequest[] => {
  const body = rows.length > 0 && !(CATEGORY_ORDER as readonly string[]).includes(normalizeCategory(rows[0][1] ?? "")) ? rows.slice(1) : rows;
  return body.map(([teamName = "", category = "", professorName = "", ...rest]) => {
    const studentInfos = [];
    for (let i = 0; i < rest.length; i += 3) {
      const [studentName = "", studentNumber = "", studentEmail = ""] = rest.slice(i, i + 3);
      if (studentName || studentNumber || studentEmail) studentInfos.push({ studentName, studentNumber, studentEmail });
    }
    return { teamName, category: normalizeCategory(category), professorName, studentInfos };
  });
};

/** 계정 발급: 파일 선택 → 검토(학생·교수 목록과 대조) → 등록 */
const AccountImportDialog = ({ year, onClose, onDone }: { year: number; onClose: () => void; onDone: () => void }) => {
  const { data: info, isPending, isError } = useQuery({ queryKey: adminKeys.accountSetInfo, queryFn: adminApi.accountSetInfo, staleTime: 0 });
  const [teams, setTeams] = useState<IAccountTeamRequest[]>([]);
  const [fileName, setFileName] = useState("");
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [over, setOver] = useState(false);
  const [manual, setManual] = useState({ teamName: "", category: "WEB", professorName: "", studentNumber: "", studentEmail: "" });

  const load = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseTeams(await readCsv(file));
      if (parsed.length === 0) notify.info("파일에 팀이 없습니다.");
      setTeams((t) => [...t, ...parsed]);
      setFileName(file.name);
    } catch {
      notify.error("CSV 파일을 읽지 못했습니다. UTF-8 형식인지 확인하세요.");
    }
  };

  const checked = info ? teams.map((t) => problemsOf(t, teams, info)) : [];
  const bad = checked.filter((p) => p.length > 0).length;
  const step = teams.length === 0 ? 1 : 2;

  const addManual = () => {
    const student = info?.students.find((s) => s.studentNumber === manual.studentNumber);
    if (!manual.teamName.trim() || !manual.professorName || !student) {
      notify.info("팀명, 지도교수, 팀장 학생을 모두 고르세요.");
      return;
    }
    if (!isEmail(manual.studentEmail)) {
      notify.info("팀장 이메일을 입력하세요. 이 이메일이 계정 아이디가 됩니다.");
      return;
    }
    setTeams((t) => [
      ...t,
      {
        teamName: manual.teamName.trim(),
        category: manual.category,
        professorName: manual.professorName,
        studentInfos: [{ studentName: student.studentName, studentNumber: student.studentNumber, studentEmail: manual.studentEmail.trim() }],
      },
    ]);
    setManual({ teamName: "", category: manual.category, professorName: manual.professorName, studentNumber: "", studentEmail: "" });
  };

  const submit = async () => {
    setSending(true);
    try {
      await adminApi.registerAccounts({ year, registerAccounts: teams });
      notify.ok(`${teams.length}개 팀의 계정을 발급했습니다.`);
      onDone();
    } catch {
      notify.error("발급하지 못했습니다. 일부 팀만 만들어졌을 수 있으니 팀 목록을 확인하세요.");
    } finally {
      setSending(false);
    }
  };

  const shown = teams.map((t, i) => ({ t, i, problems: checked[i] ?? [] })).filter((r) => !onlyErrors || r.problems.length > 0);

  return (
    <Dialog
      open
      title={`계정 일괄 발급 · ${year}`}
      description="팀마다 한 줄씩 입력합니다. 첫 번째 학생이 팀장이 되고, 팀장 이메일이 계정 아이디, 팀장 학번이 처음 비밀번호가 됩니다."
      onClose={onClose}
      width={880}
      locked={sending}
      footer={
        <>
          <span className={styles.summary} style={{ marginRight: "auto" }}>
            {teams.length > 0 && (
              <>
                <span className={styles.badge} data-tone="ok">
                  정상 {teams.length - bad}
                </span>
                {bad > 0 && (
                  <span className={styles.badge} data-tone="warn">
                    수정 필요 {bad}
                  </span>
                )}
              </>
            )}
          </span>
          <button type="button" className={kit.btn} onClick={onClose} disabled={sending}>
            취소
          </button>
          <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={submit} disabled={teams.length === 0 || bad > 0 || sending || !info}>
            <Icon name="check" />
            {sending ? "발급 중" : `${teams.length}개 팀 발급`}
          </button>
        </>
      }
    >
      <div className={styles.steps}>
        <span data-on={step === 1 || undefined}>1. 파일 선택</span>·<span data-on={step === 2 || undefined}>2. 검토 · 수정</span>·<span>3. 발급</span>
      </div>
      {isError && <p className={styles.rowError}>학생·교수 목록을 불러오지 못했습니다. 창을 닫았다가 다시 열어 주세요.</p>}

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
        {fileName ? `${fileName} · ${teams.length}팀 (다른 파일을 더 넣으면 이어 붙습니다)` : "CSV 파일을 눌러서 고르거나 끌어다 놓으세요"}
        <span className={kit.help}>브라우저 안에서만 읽고, 발급 버튼을 누르기 전에는 서버로 보내지 않습니다</span>
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
      <button
        type="button"
        className={`${kit.btn} ${kit.small} ${kit.ghost}`}
        style={{ alignSelf: "flex-start" }}
        onClick={() =>
          downloadCsv("계정발급_양식.csv", [
            ["팀명", "분야", "지도교수", "팀장 이름", "팀장 학번", "팀장 이메일", "팀원 이름", "팀원 학번", "팀원 이메일"],
            ["예시팀", "WEB", "교수 이름", "홍길동", "2023000001", "leader@example.com", "김철수", "2023000002", "member@example.com"],
          ])
        }
      >
        <Icon name="download" />
        양식 받기
      </button>

      <details className={styles.manual}>
        <summary>한 팀씩 직접 입력</summary>
        <div className={styles.manualRow}>
          <label className={kit.field}>
            팀명
            <input className={kit.input} value={manual.teamName} onChange={(e) => setManual({ ...manual, teamName: e.target.value })} />
          </label>
          <label className={kit.field}>
            분야
            <select className={kit.select} value={manual.category} onChange={(e) => setManual({ ...manual, category: e.target.value })}>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className={kit.field}>
            지도교수
            <select className={kit.select} value={manual.professorName} onChange={(e) => setManual({ ...manual, professorName: e.target.value })} disabled={isPending}>
              <option value="">선택</option>
              {info?.professors.map((p) => (
                <option key={p.professorName} value={p.professorName}>
                  {p.professorName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.manualRow}>
          <label className={kit.field}>
            팀장 학생
            <select
              className={kit.select}
              value={manual.studentNumber}
              disabled={isPending}
              onChange={(e) => {
                const s = info?.students.find((x) => x.studentNumber === e.target.value);
                setManual({ ...manual, studentNumber: e.target.value, studentEmail: manual.studentEmail || s?.studentEmail || "" });
              }}
            >
              <option value="">선택</option>
              {info?.students.map((s) => (
                <option key={s.studentNumber} value={s.studentNumber}>
                  {s.studentName} ({s.studentNumber})
                </option>
              ))}
            </select>
          </label>
          <label className={kit.field}>
            팀장 이메일 (계정 아이디)
            <input className={kit.input} type="email" value={manual.studentEmail} onChange={(e) => setManual({ ...manual, studentEmail: e.target.value })} />
          </label>
          <button type="button" className={kit.btn} onClick={addManual}>
            <Icon name="plus" />
            목록에 추가
          </button>
        </div>
      </details>

      {teams.length > 0 && (
        <>
          <label className={styles.summary}>
            <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} />
            수정이 필요한 줄만 보기
          </label>
          <div className={styles.previewWrap}>
            <table className={styles.plainTable}>
              <thead>
                <tr>
                  <th>줄</th>
                  <th>팀명</th>
                  <th>분야</th>
                  <th>지도교수</th>
                  <th>학생 (첫 번째가 팀장)</th>
                  <th>상태</th>
                  <th>
                    <span className="visually-hidden">빼기</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map(({ t, i, problems }) => (
                  <tr key={i}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td className={styles.strong}>{t.teamName}</td>
                    <td>{categoryLabel(t.category)}</td>
                    <td>{t.professorName}</td>
                    <td>
                      {t.studentInfos.map((s, j) => (
                        <div key={j}>
                          {s.studentName} <span className={styles.mono}>{s.studentNumber}</span> <span className={styles.muted}>{s.studentEmail}</span>
                        </div>
                      ))}
                    </td>
                    <td>
                      {!info ? (
                        <span className={styles.muted}>확인 중</span>
                      ) : problems.length ? (
                        problems.map((p) => (
                          <div key={p} className={styles.rowError}>
                            {p}
                          </div>
                        ))
                      ) : (
                        <span className={styles.badge} data-tone="ok">
                          정상
                        </span>
                      )}
                    </td>
                    <td>
                      <button type="button" className={`${kit.btn} ${kit.small} ${kit.ghost}`} aria-label={`${t.teamName} 빼기`} onClick={() => setTeams((list) => list.filter((_, j) => j !== i))}>
                        <Icon name="close" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Dialog>
  );
};
