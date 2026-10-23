import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { postGetTeampostEdit } from "@api/teamPost";
import { useExhibitionYear } from "@src/app/YearContext";
import { FilePicker } from "@components/exhibition/FilePicker";
import { Dialog } from "@components/kit/Dialog";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import { CATEGORY_ORDER, categoryLabel } from "@src/features/exhibition/categories";
import { exhibitionKeys, useProjects } from "@src/features/exhibition/queries";
import { isStudentModified, saveTeamPost, type MediaValue, type TeamPostForm } from "@src/features/teamEdit/saveTeamPost";
import { useLeaveGuard } from "@src/features/teamEdit/useLeaveGuard";
import type { ITeamPostEdit, ITeamPostEditStudent } from "@interface";
import styles from "./TeamEditPage.module.css";

const MAX_CONTENT = 500;
const MAX_VIDEO_MB = 500;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

const checkImage = (file: File) => (IMAGE_TYPES.includes(file.type) ? null : "jpg, png 형식만 업로드할 수 있습니다.");
const checkVideo = (file: File) => {
  if (file.size / (1024 * 1024) > MAX_VIDEO_MB) return `${MAX_VIDEO_MB}MB 이하의 영상만 업로드할 수 있습니다.`;
  if (!file.type.startsWith("video/")) return "영상 파일만 업로드할 수 있습니다.";
  return null;
};

const toastError = (message: string) => toast.error(message, { position: "top-center", autoClose: 4000 });

/** 파일이면 미리보기 주소를 만들고, 바뀌거나 사라지면 정리한다 */
const usePreview = (value: MediaValue) => {
  const url = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : value || null), [value]);
  useEffect(() => () => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }, [url]);
  return url;
};

const formOf = (data: ITeamPostEdit): TeamPostForm => ({
  title: data.title ?? "",
  content: data.content ?? "",
  category: data.category ?? "",
  teamProfileImage: data.teamProfileImage ?? "",
  demoVideo: data.demoVideo ?? "",
  posterImage: data.posterImage ?? "",
});

const byRoleThenName = (a: ITeamPostEditStudent, b: ITeamPostEditStudent) =>
  a.role === b.role ? a.name.localeCompare(b.name, "ko") : a.role === "LEADER" ? -1 : b.role === "LEADER" ? 1 : 0;

const TeamEditPage = () => {
  const { year } = useExhibitionYear();
  const { team_uuid: uuid = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects(year);
  const teamName = projects.find((p) => p.uuid === uuid)?.teamName ?? "";

  const { data, isPending, isError } = useQuery({
    queryKey: ["teamPostEdit", uuid],
    queryFn: (): Promise<ITeamPostEdit> => postGetTeampostEdit(uuid),
    enabled: !!uuid,
    staleTime: 0,
    gcTime: 0,
  });

  const [form, setForm] = useState<TeamPostForm | null>(null);
  const [students, setStudents] = useState<ITeamPostEditStudent[]>([]);
  const [editing, setEditing] = useState<ITeamPostEditStudent | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;
    setForm(formOf(data));
    setStudents(data.students ?? []);
  }, [data]);

  const original = data ? formOf(data) : null;
  const changes = form && original ? (Object.keys(form) as (keyof TeamPostForm)[]).filter((k) => form[k] !== original[k]).length : 0;
  const studentChanges = data ? students.filter((s, i) => isStudentModified(data.students[i], s)).length : 0;
  const dirty = changes + studentChanges > 0;
  const allowLeave = useLeaveGuard(dirty && progress === null);

  const teamProfile = usePreview(form?.teamProfileImage ?? "");
  const poster = usePreview(form?.posterImage ?? "");
  const video = usePreview(form?.demoVideo ?? "");
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => setVideoFailed(false), [video]);

  const set = <K extends keyof TeamPostForm>(key: K, value: TeamPostForm[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const detailPath = `/${year}/project/${uuid}`;

  const save = async () => {
    if (!form || !data) return;
    setProgress(0);
    try {
      const response = await saveTeamPost({ teamUuid: uuid, form, students, originalStudents: data.students, onProgress: setProgress });
      if (response) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: exhibitionKeys.teamPost(uuid) }),
          queryClient.invalidateQueries({ queryKey: exhibitionKeys.projects(year) }),
        ]);
        toast.success("저장되었습니다.", { position: "top-center", autoClose: 2500 });
        allowLeave();
        navigate(detailPath, { replace: true });
      }
    } catch {
      toastError("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setProgress(null);
    }
  };

  const revert = () => {
    if (!data || !window.confirm("저장하지 않은 변경을 모두 되돌릴까요?")) return;
    setForm(formOf(data));
    setStudents(data.students ?? []);
  };

  if (isError) {
    return (
      <main className={styles.state}>
        <h1>팀 정보를 불러오지 못했습니다</h1>
        <p>다시 시도하거나, 로그인한 계정이 이 팀의 계정인지 확인해 주세요.</p>
        <Link className={kit.btn} to={detailPath}>
          <Icon name="arrowLeft" />
          작품으로 돌아가기
        </Link>
      </main>
    );
  }

  if (isPending || !form) {
    return <main className={styles.state} aria-busy="true" aria-label="팀 정보를 불러오는 중" />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Link className={styles.back} to={detailPath}>
          <Icon name="arrowLeft" />
          작품으로 돌아가기
        </Link>
      </div>

      <section className={styles.head}>
        <span className={styles.kicker}>작품 수정{teamName && ` · ${teamName}`}</span>
        <label className={styles.titleField}>
          <span className="visually-hidden">작품 제목</span>
          <input className={styles.title} value={form.title} placeholder="작품 제목" maxLength={255} onChange={(e) => set("title", e.target.value)} />
        </label>
      </section>

      <div className={styles.body}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2>분야</h2>
            <div className={styles.segments} role="radiogroup" aria-label="분야">
              {CATEGORY_ORDER.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={form.category === c} onClick={() => set("category", c)}>
                  {categoryLabel(c)}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>
                <label htmlFor="content">작품 소개</label>
              </h2>
              <span className={styles.count} data-full={form.content.length >= MAX_CONTENT || undefined}>
                {form.content.length} / {MAX_CONTENT}
              </span>
            </div>
            <textarea
              id="content"
              className={kit.textarea}
              rows={8}
              maxLength={MAX_CONTENT}
              value={form.content}
              placeholder="작품이 어떤 문제를 풀었는지, 무엇을 할 수 있는지 소개해 주세요. 줄바꿈은 그대로 보입니다."
              onChange={(e) => set("content", e.target.value)}
            />
          </section>

          <section className={styles.section}>
            <h2>시연 영상</h2>
            <FilePicker
              label="시연 영상"
              accept=".mkv,.mp4,.avi"
              hint={`mkv, mp4, avi · ${MAX_VIDEO_MB}MB 이하`}
              ratio="16 / 9"
              validate={checkVideo}
              onError={toastError}
              onPick={(file) => set("demoVideo", file)}
              onRemove={() => set("demoVideo", "")}
              preview={
                video ? (
                  videoFailed ? (
                    <div className={styles.videoError}>
                      <Icon name="alert" size={22} />
                      이 브라우저에서 미리 볼 수 없는 형식(H.265 등)입니다. 저장하면 그대로 업로드됩니다.
                    </div>
                  ) : (
                    <video key={video} src={video} controls preload="metadata" onError={() => setVideoFailed(true)} />
                  )
                ) : undefined
              }
            />
          </section>

          <section className={styles.section}>
            <h2>포스터</h2>
            <div className={styles.posterBox}>
              <FilePicker
                label="포스터"
                accept=".jpg,.png"
                hint="jpg, png · 세로 3:4 권장"
                ratio="3 / 4"
                validate={checkImage}
                onError={toastError}
                onPick={(file) => set("posterImage", file)}
                onRemove={() => set("posterImage", "")}
                preview={poster ? <img src={poster} alt="포스터 미리보기" /> : undefined}
              />
            </div>
          </section>
        </div>

        <aside className={styles.aside}>
          <section className={styles.section}>
            <h2>대표 이미지</h2>
            <FilePicker
              label="대표 이미지"
              accept=".jpg,.png"
              hint="jpg, png · 정사각형 권장"
              validate={checkImage}
              onError={toastError}
              onPick={(file) => set("teamProfileImage", file)}
              onRemove={() => set("teamProfileImage", "")}
              preview={teamProfile ? <img src={teamProfile} alt="대표 이미지 미리보기" /> : undefined}
            />
          </section>
        </aside>
      </div>

      <section className={styles.members}>
        <div className={styles.sectionHead}>
          <h2>팀원</h2>
          <span className={styles.count}>카드를 눌러 소개와 링크를 수정합니다</span>
        </div>
        <div className={styles.memberGrid}>
          {students
            .map((s, i) => ({ s, changed: data ? isStudentModified(data.students[i], s) : false }))
            .sort((a, b) => byRoleThenName(a.s, b.s))
            .map(({ s, changed }) => (
              <button key={s.encryptedStudentProfileId} type="button" className={styles.member} onClick={() => setEditing(s)} data-changed={changed || undefined}>
                <span className={styles.memberImage}>{s.profileImage ? <img src={s.profileImage} alt="" /> : <span aria-hidden="true">{s.name.slice(0, 1)}</span>}</span>
                <span className={styles.memberName}>
                  <strong>{s.name}</strong>
                  {s.role === "LEADER" && <span className={styles.badge}>팀장</span>}
                </span>
                <span className={styles.memberInfo}>{s.info || "소개 없음"}</span>
                <span className={styles.memberEdit}>
                  <Icon name="pen" size={14} />
                  {changed ? "수정됨" : "수정"}
                </span>
              </button>
            ))}
        </div>
      </section>

      <div className={kit.bar} role="region" aria-label="저장">
        <span className={kit.barText}>
          {dirty ? (
            <>
              <span className={kit.dot} />
              저장하지 않은 변경 {changes + studentChanges}건
            </>
          ) : (
            "변경 사항 없음"
          )}
        </span>
        <span className={kit.barActions}>
          <button type="button" className={`${kit.btn} ${kit.ghost}`} onClick={revert} disabled={!dirty}>
            <Icon name="reset" />
            되돌리기
          </button>
          <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={save} disabled={!dirty || progress !== null}>
            <Icon name="save" />
            저장
          </button>
        </span>
      </div>

      {editing && (
        <StudentDialog
          student={editing}
          onClose={() => setEditing(null)}
          onApply={(next) => {
            setStudents((list) => list.map((s) => (s.encryptedStudentProfileId === next.encryptedStudentProfileId ? next : s)));
            setEditing(null);
          }}
        />
      )}

      <Dialog open={progress !== null} title="저장하는 중" locked onClose={() => {}} width={400}>
        <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress ?? 0}>
          <span style={{ transform: `scaleX(${Math.min(100, progress ?? 0) / 100})` }} />
        </div>
        <p className={styles.progressText}>{Math.min(100, progress ?? 0)}% · 영상이 크면 몇 분 걸릴 수 있습니다. 창을 닫지 마세요.</p>
      </Dialog>
    </main>
  );
};

/** 팀원 한 명의 소개·링크·사진 수정 */
const StudentDialog = ({ student, onClose, onApply }: { student: ITeamPostEditStudent; onClose: () => void; onApply: (s: ITeamPostEditStudent) => void }) => {
  const [draft, setDraft] = useState(student);
  const field = (key: "info" | "studentBlog" | "studentEmail" | "githubUrl") => ({
    value: draft[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [key]: e.target.value }),
  });

  return (
    <Dialog
      open
      title={student.name}
      description={student.role === "LEADER" ? "팀장" : "팀원"}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button type="button" className={kit.btn} onClick={onClose}>
            취소
          </button>
          <button type="button" className={`${kit.btn} ${kit.primary}`} onClick={() => onApply(draft)}>
            <Icon name="check" />
            적용
          </button>
        </>
      }
    >
      <div className={styles.studentForm}>
        <div className={styles.studentPhoto}>
          <FilePicker
            label="사진"
            accept=".jpg,.png"
            hint="jpg, png"
            ratio="4 / 5"
            validate={checkImage}
            onError={toastError}
            onPick={(file) => setDraft({ ...draft, profileImage: URL.createObjectURL(file) })}
            onRemove={() => setDraft({ ...draft, profileImage: "" })}
            preview={draft.profileImage ? <img src={draft.profileImage} alt={`${student.name} 사진 미리보기`} /> : undefined}
          />
        </div>
        <div className={styles.studentFields}>
          <label className={kit.field}>
            소개
            <input className={kit.input} placeholder="맡은 역할이나 한 줄 소개" maxLength={255} {...field("info")} />
          </label>
          <label className={kit.field}>
            이메일
            <input className={kit.input} type="email" placeholder="name@example.com" maxLength={255} {...field("studentEmail")} />
          </label>
          <label className={kit.field}>
            GitHub
            <input className={kit.input} type="url" placeholder="https://github.com/아이디" maxLength={255} {...field("githubUrl")} />
          </label>
          <label className={kit.field}>
            블로그
            <input className={kit.input} type="url" placeholder="https://" maxLength={255} {...field("studentBlog")} />
          </label>
          <p className={kit.help}>적용한 내용은 아래 저장 버튼을 눌러야 반영됩니다.</p>
        </div>
      </div>
    </Dialog>
  );
};

export default TeamEditPage;
