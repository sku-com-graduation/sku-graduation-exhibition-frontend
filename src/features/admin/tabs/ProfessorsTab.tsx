import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import axios from "axios";
import { Dialog } from "@components/kit/Dialog";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import type { IProfessor } from "@interface";
import { mimeToExt } from "@utils/File";
import { adminApi, adminKeys } from "../adminApi";
import { isEmail } from "../csv";
import { DataTable, TextCell } from "../DataTable";
import { DirtyBar, Legend, notify, Search, SelectionBar, TabHead, type TabProps } from "../parts";
import { useDraft } from "../useDraft";
import styles from "../admin.module.css";

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const idOf = (p: IProfessor) => p.encryptedProfessorId;

export const ProfessorsTab = ({ year, onDirtyChange }: TabProps) => {
  const { data = [], isPending, isError, refetch } = useQuery({ queryKey: adminKeys.professors, queryFn: adminApi.professors });
  const draft = useDraft(data, idOf);
  // 새로 고른 사진 파일. 표에는 미리보기 주소(blob:)를 넣고 파일은 따로 둔다
  const [files, setFiles] = useState<Map<string, File>>(new Map());
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const pickPhoto = (id: string, file: File | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      notify.info("jpg, png 사진만 올릴 수 있습니다.");
      return;
    }
    setFiles((m) => new Map(m).set(id, file));
    draft.update(id, { profileImage: URL.createObjectURL(file) });
  };

  const columns = useMemo<ColumnDef<IProfessor, unknown>[]>(
    () => [
      {
        id: "photo",
        header: "사진",
        size: 170,
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className={styles.photoCell}>
              <span className={styles.avatar}>{p.profileImage ? <img src={p.profileImage} alt="" /> : (p.name || "?").slice(0, 1)}</span>
              <label className={`${kit.btn} ${kit.small} ${kit.ghost}`}>
                {p.profileImage ? "바꾸기" : "올리기"}
                <input
                  className="visually-hidden"
                  type="file"
                  accept=".jpg,.png"
                  aria-label={`${p.name} 사진 선택`}
                  onChange={(e) => {
                    pickPhoto(row.id, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {p.profileImage && (
                <button
                  type="button"
                  className={`${kit.btn} ${kit.small} ${kit.ghost} ${kit.icon}`}
                  aria-label={`${p.name} 사진 삭제`}
                  onClick={() => {
                    setFiles((m) => {
                      const next = new Map(m);
                      next.delete(row.id);
                      return next;
                    });
                    draft.update(row.id, { profileImage: "" });
                  }}
                >
                  <Icon name="trash" />
                </button>
              )}
            </span>
          );
        },
      },
      { accessorKey: "name", header: "이름", cell: ({ row }) => <TextCell label="이름" value={row.original.name} onChange={(v) => draft.update(row.id, { name: v })} /> },
      { accessorKey: "email", header: "이메일", cell: ({ row }) => <TextCell label="이메일" type="email" value={row.original.email} onChange={(v) => draft.update(row.id, { email: v })} /> },
      {
        accessorKey: "tenure",
        header: "재직",
        size: 90,
        cell: ({ row }) => (
          <button
            type="button"
            role="switch"
            className={styles.switch}
            aria-checked={row.original.tenure}
            aria-label={`${row.original.name} 재직 여부`}
            onClick={() => draft.update(row.id, { tenure: !row.original.tenure })}
          />
        ),
      },
    ],
    [draft],
  );

  const selectedIds = Object.keys(selection).filter((id) => selection[id]);

  /** 사진을 새로 골랐을 때만 올린다. 그대로면 기존 주소를, 지웠으면 삭제를 보낸다 */
  const save = async () => {
    const bad = draft.changed.find((p) => !p.name.trim() || !isEmail(p.email));
    if (bad) {
      notify.info(`${bad.name || "이름 없는 교수"}: 이름과 이메일 형식을 확인하세요.`);
      return;
    }
    setSaving(true);
    try {
      for (const p of draft.changed) {
        const original = data.find((o) => o.encryptedProfessorId === p.encryptedProfessorId);
        const file = files.get(p.encryptedProfessorId);
        let profileImage = original?.profileImage ?? "";
        let operation: "UPLOAD" | "DELETE" = "UPLOAD";
        if (file) {
          const upload = await adminApi.professorUploadUrl({
            encryptedProfessorId: p.encryptedProfessorId,
            fileType: "PROFESSOR",
            contentType: file.type,
            extension: mimeToExt(file.type),
          });
          await axios.put(upload.s3Url, file, { headers: { "Content-Type": file.type } });
          profileImage = upload.cloudFrontUrl;
        } else if (!p.profileImage) {
          profileImage = "";
          operation = "DELETE";
        }
        const form = new FormData();
        form.append("encryptedProfessorId", p.encryptedProfessorId);
        form.append("name", p.name.trim());
        form.append("email", p.email.trim());
        form.append("tenure", String(p.tenure));
        form.append("profileImage", profileImage);
        form.append("profileImageOperation", operation);
        await adminApi.updateProfessor(form);
      }
      setFiles(new Map());
      draft.reset();
      await refetch();
      notify.ok("저장했습니다.");
    } catch {
      await refetch();
      notify.error("저장하지 못했습니다. 일부만 저장됐을 수 있으니 목록을 확인하세요.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`${selectedIds.length}명 교수를 삭제하시겠습니까?\n이 교수가 지도하던 팀은 지도교수가 비게 됩니다.`)) return;
    try {
      await adminApi.deleteProfessors(selectedIds);
      setSelection({});
      draft.reset();
      await refetch();
      notify.ok("교수를 삭제했습니다.");
    } catch {
      notify.error("교수를 삭제하지 못했습니다.");
    }
  };

  return (
    <>
      <TabHead year={year} crumb="교수" title="교수 관리">
        <Search value={search} onChange={setSearch} placeholder="이름 또는 이메일" />
        <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={() => setAdding(true)}>
          <Icon name="plus" />
          교수 등록
        </button>
      </TabHead>
      <Legend count={draft.view.length} />
      <DataTable
        data={draft.view}
        columns={columns}
        getRowId={idOf}
        search={search}
        selection={selection}
        onSelectionChange={setSelection}
        changedIds={draft.changedIds}
        loading={isPending}
        rowLabel={(r) => r.name}
        empty={isError ? "교수 목록을 불러오지 못했습니다." : "등록된 교수가 없습니다."}
      />
      <p className={styles.note}>교수 목록은 연도와 관계없이 모든 전시에서 함께 씁니다. 사진은 jpg, png입니다.</p>
      <SelectionBar count={selectedIds.length} onClear={() => setSelection({})}>
        <button type="button" className={`${kit.btn} ${kit.small} ${styles.barDanger}`} onClick={remove}>
          <Icon name="trash" />
          삭제
        </button>
      </SelectionBar>
      <DirtyBar
        count={draft.changed.length}
        saving={saving}
        onReset={() => {
          setFiles(new Map());
          draft.reset();
        }}
        onSave={save}
        onDirtyChange={onDirtyChange}
      />
      {adding && (
        <AddProfessorDialog
          onClose={() => setAdding(false)}
          onDone={async () => {
            setAdding(false);
            await refetch();
          }}
        />
      )}
    </>
  );
};

const AddProfessorDialog = ({ onClose, onDone }: { onClose: () => void; onDone: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tenure, setTenure] = useState(true);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!name.trim() || !isEmail(email.trim())) {
      notify.info("이름과 이메일을 확인하세요.");
      return;
    }
    setSending(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("email", email.trim());
      form.append("tenure", String(tenure));
      form.append("profileImage", "");
      await adminApi.addProfessor(form);
      notify.ok("교수를 등록했습니다. 사진은 목록에서 올릴 수 있습니다.");
      onDone();
    } catch {
      notify.error("등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      title="교수 등록"
      onClose={onClose}
      locked={sending}
      footer={
        <>
          <button type="button" className={kit.btn} onClick={onClose} disabled={sending}>
            취소
          </button>
          <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={submit} disabled={sending}>
            <Icon name="check" />
            {sending ? "등록 중" : "등록"}
          </button>
        </>
      }
    >
      <label className={kit.field}>
        이름
        <input className={kit.input} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={kit.field}>
        이메일
        <input className={kit.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className={styles.summary}>
        <button type="button" role="switch" className={styles.switch} aria-checked={tenure} onClick={() => setTenure(!tenure)} aria-label="재직 여부" />
        재직 중
      </label>
    </Dialog>
  );
};
