import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useExhibitionYear } from "@src/app/YearContext";
import { Icon } from "@components/site/Icon";
import { Lightbox } from "@components/exhibition/Lightbox";
import { TeamImage } from "@components/exhibition/TeamImage";
import { useSession } from "@src/features/auth/useSession";
import { categoryLabel } from "@src/features/exhibition/categories";
import { useProjects, useTeamPost } from "@src/features/exhibition/queries";
import type { IProject, ITeamStudent } from "@interface";
import styles from "./WorkDetailPage.module.css";

/** 학생이 입력한 주소는 http(s)만 링크로 만든다 */
const safeUrl = (value: string | null | undefined) => {
  if (!value) return null;
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(url).protocol.startsWith("http") ? url : null;
  } catch {
    return null;
  }
};

const byName = (a: ITeamStudent, b: ITeamStudent) => a.name.localeCompare(b.name, "ko");

const SECTIONS = [
  { id: "video", label: "시연 영상" },
  { id: "overview", label: "작품 소개" },
  { id: "screens", label: "스크린샷" },
  { id: "poster", label: "포스터" },
  { id: "members", label: "팀원" },
] as const;

const WorkDetailPage = () => {
  const { year } = useExhibitionYear();
  const { team_uuid: uuid } = useParams();
  const { auth, isAdmin } = useSession();
  const { data: post, isPending, isError, dataUpdatedAt } = useTeamPost(uuid);
  const { data: projects = [] } = useProjects(year);
  const [zoom, setZoom] = useState<{ images: string[]; index: number; label: string } | null>(null);

  // 수정하면 같은 주소에 파일을 덮어쓰므로, 새로 불러올 때마다 캐시를 피하는 값을 붙인다
  const fresh = (url: string | null | undefined) => (url ? `${url}${url.includes("?") ? "&" : "?"}v=${dataUpdatedAt}` : null);

  const info = post?.teamInfo;
  const self = projects.find((p) => p.uuid === uuid);
  const teamName = self?.teamName ?? "";
  const title = info?.title || teamName || "작품";
  const index = projects.findIndex((p) => p.uuid === uuid);
  const prev = index >= 0 && projects.length > 1 ? projects[(index - 1 + projects.length) % projects.length] : null;
  const next = index >= 0 && projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  useEffect(() => {
    if (post) document.title = `${title} · ${year} 졸업작품전`;
    return () => {
      document.title = "성결대학교 컴퓨터공학과 졸업작품전";
    };
  }, [post, title, year]);

  if (isError) {
    return (
      <main className={styles.missing}>
        <h1>작품을 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 삭제된 작품일 수 있습니다.</p>
        <Link className={styles.outline} to={`/${year}/project`}>
          <Icon name="arrowLeft" />
          작품 목록
        </Link>
      </main>
    );
  }

  const profile = fresh(info?.teamProfileImage);
  const video = fresh(info?.demoVideo);
  const slides = (info?.slideImages ?? []).filter(Boolean).map((s) => fresh(s)!);
  const poster = fresh(info?.posterImage);
  const students = post?.students ?? [];
  const leaders = students.filter((s) => s.role === "LEADER").sort(byName);
  const members = students.filter((s) => s.role !== "LEADER").sort(byName);
  const professor = post?.professorInfo?.professorName ? post.professorInfo : null;
  const canEdit = !!uuid && (isAdmin || auth.uuid === uuid);
  const visible = SECTIONS.filter((s) => (s.id === "screens" ? slides.length > 0 : s.id === "poster" ? !!poster : true));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크를 복사했습니다.", { position: "bottom-center", autoClose: 2000, hideProgressBar: true });
    } catch {
      toast.error("링크를 복사하지 못했습니다.", { position: "bottom-center", autoClose: 2000, hideProgressBar: true });
    }
  };

  return (
    <>
      {prev && next && <Remote year={year} prev={prev} next={next} />}

      <main className={styles.page}>
        <div className={styles.topbar}>
          <Link className={styles.back} to={`/${year}/project`}>
            <Icon name="arrowLeft" />
            작품 목록
          </Link>
          <div className={styles.topRight}>
            {canEdit && (
              <Link className={styles.outline} to="edit">
                <Icon name="pen" />
                작품 수정
              </Link>
            )}
            {index >= 0 && (
              <span>
                {index + 1} / {projects.length}
              </span>
            )}
          </div>
        </div>

        <section className={styles.head}>
          <span className={styles.kicker}>
            {info && categoryLabel(info.category)}
            {teamName && ` · ${teamName}`}
          </span>
          <h1 className={styles.title}>{isPending ? " " : title}</h1>
        </section>

        <div className={styles.body}>
          <div className={styles.content}>
            <section id="video" className={styles.videoSection} aria-label="시연 영상">
              <DemoVideo src={video} poster={profile} loading={isPending} />
            </section>

            <section id="overview" className={`${styles.section} reveal`}>
              <h2>작품 소개</h2>
              {info?.content ? <p className={styles.text}>{info.content}</p> : <p className={styles.placeholder}>작품 소개가 아직 등록되지 않았습니다.</p>}
            </section>

            {slides.length > 0 && (
              <section id="screens" className={`${styles.section} reveal`}>
                <h2>스크린샷</h2>
                <div className={styles.shots}>
                  {slides.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      className={styles.zoom}
                      aria-label={`스크린샷 ${i + 1} 크게 보기`}
                      onClick={() => setZoom({ images: slides, index: i, label: "스크린샷" })}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {poster && (
              <section id="poster" className={`${styles.section} reveal`}>
                <div className={styles.sectionHead}>
                  <h2>포스터</h2>
                  <button type="button" className={styles.small} onClick={() => setZoom({ images: [poster], index: 0, label: "포스터" })}>
                    <Icon name="expand" size={14} />
                    원본 크게 보기
                  </button>
                </div>
                <button type="button" className={`${styles.zoom} ${styles.poster}`} aria-label="포스터 크게 보기" onClick={() => setZoom({ images: [poster], index: 0, label: "포스터" })}>
                  <img src={poster} alt={`${title} 포스터`} loading="lazy" />
                </button>
              </section>
            )}
          </div>

          <aside className={styles.aside} aria-label="작품 정보">
            <div className={styles.profile}>
              {info && <TeamImage src={profile} teamName={teamName} category={info.category} alt={`${teamName} 대표 이미지`} />}
            </div>
            <dl className={styles.facts}>
              <dt>분야</dt>
              <dd>{info ? categoryLabel(info.category) : " "}</dd>
              <dt>팀</dt>
              <dd>{teamName || " "}</dd>
              {professor && (
                <>
                  <dt>지도교수</dt>
                  <dd>{professor.professorName}</dd>
                </>
              )}
              {students.length > 0 && (
                <>
                  <dt>팀원</dt>
                  <dd>{[...leaders, ...members].map((s) => s.name).join(", ")}</dd>
                </>
              )}
            </dl>
            <Toc sections={visible} />
            <button type="button" className={styles.outline} onClick={copyLink}>
              <Icon name="link" />
              링크 복사
            </button>
          </aside>
        </div>

        {(professor || students.length > 0) && (
          <section id="members" className={styles.members}>
            <h2>팀원</h2>
            {(professor || leaders.length > 0) && (
              <div className={styles.memberGroup}>
                <span className={styles.groupLabel}>{professor ? "지도교수 · 팀장" : "팀장"}</span>
                <div className={styles.memberRow}>
                  {professor && (
                    <Member
                      name={professor.professorName}
                      badge="지도교수"
                      image={fresh(professor.professorImage)}
                      email={professor.professorEmail}
                    />
                  )}
                  {leaders.map((s) => (
                    <Member key={s.name} badge="팀장" lead name={s.name} image={fresh(s.profileImage)} info={s.info} github={s.githubUrl} blog={s.studentBlog} email={s.studentEmail} />
                  ))}
                </div>
              </div>
            )}
            {members.length > 0 && (
              <div className={`${styles.memberGroup} ${styles.divided}`}>
                <span className={styles.groupLabel}>팀원</span>
                <div className={styles.memberRow}>
                  {members.map((s) => (
                    <Member key={s.name} name={s.name} image={fresh(s.profileImage)} info={s.info} github={s.githubUrl} blog={s.studentBlog} email={s.studentEmail} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {prev && next && (
        <nav className={styles.mbar} aria-label="다른 작품">
          <Link to={`/${year}/project/${prev.uuid}`}>
            <span>← 이전</span>
            <strong>{prev.title || prev.teamName}</strong>
          </Link>
          <Link to={`/${year}/project/${next.uuid}`}>
            <span>다음 →</span>
            <strong>{next.title || next.teamName}</strong>
          </Link>
        </nav>
      )}

      <Lightbox
        images={zoom?.images ?? []}
        index={zoom ? zoom.index : null}
        label={zoom?.label ?? ""}
        onChange={(i) => setZoom((z) => (z && i !== null ? { ...z, index: i } : null))}
      />
    </>
  );
};

/** 시연 영상. 없으면 준비 중, 브라우저가 재생하지 못하는 형식(H.265 등)이면 새 창으로 여는 링크를 보여준다. */
const DemoVideo = ({ src, poster, loading }: { src: string | null; poster: string | null; loading: boolean }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return <video className={styles.video} src={src} poster={poster ?? undefined} controls playsInline preload="metadata" onError={() => setFailed(true)} />;
  }
  return (
    <div className={styles.videoEmpty}>
      {!loading && (
        <>
          <Icon name="video" size={28} />
          {failed ? (
            <>
              <span>이 브라우저에서 재생할 수 없는 영상입니다.</span>
              <a href={src!} target="_blank" rel="noopener noreferrer">
                <Icon name="external" />
                영상 파일 열기
              </a>
            </>
          ) : (
            <span>시연 영상 준비 중</span>
          )}
        </>
      )}
    </div>
  );
};

const Remote = ({ year, prev, next }: { year: number; prev: IProject; next: IProject }) => (
  <>
    {[
      { p: prev, dir: "prev", label: "이전", arrow: "←" },
      { p: next, dir: "next", label: "다음", arrow: "→" },
    ].map(({ p, dir, label, arrow }) => (
      <Link key={dir} className={styles.remote} data-dir={dir} to={`/${year}/project/${p.uuid}`} aria-label={`${label} 작품: ${p.title || p.teamName}`}>
        <span className={styles.remoteIcon} aria-hidden="true">
          {arrow}
        </span>
        <span className={styles.remoteBody} aria-hidden="true">
          <span className={styles.remoteThumb}>
            <TeamImage src={p.teamProfileImage} teamName={p.teamName} category={p.category} />
          </span>
          <span className={styles.remoteText}>
            <small>
              {label} · {categoryLabel(p.category)}
            </small>
            <strong>{p.title || p.teamName}</strong>
          </span>
        </span>
      </Link>
    ))}
  </>
);

/** 오른쪽 목차. 지금 화면에 걸친 섹션을 표시한다 */
const Toc = ({ sections }: { sections: readonly { id: string; label: string }[] }) => {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");
  const ids = sections.map((s) => s.id).join(",");

  useEffect(() => {
    const targets = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav className={styles.toc} aria-label="이 페이지 목차">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
          {s.label}
        </a>
      ))}
    </nav>
  );
};

interface MemberProps {
  name: string;
  badge?: string;
  lead?: boolean;
  image: string | null;
  info?: string;
  github?: string;
  blog?: string;
  email?: string;
}

const Member = ({ name, badge, lead, image, info, github, blog, email }: MemberProps) => {
  const git = safeUrl(github);
  const site = safeUrl(blog);
  return (
    <article className={`${styles.member} reveal`}>
      <div className={styles.memberImage}>{image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true">{name.slice(0, 1)}</span>}</div>
      <div className={styles.memberName}>
        <h3>{name}</h3>
        {badge && (
          <span className={styles.badge} data-lead={lead || undefined}>
            {badge}
          </span>
        )}
      </div>
      {info && <p className={styles.memberInfo}>{info}</p>}
      {(git || site || email) && (
        <div className={styles.memberLinks}>
          {git && (
            <a href={git} target="_blank" rel="noopener noreferrer">
              <Icon name="code" size={14} />
              GitHub
            </a>
          )}
          {site && (
            <a href={site} target="_blank" rel="noopener noreferrer">
              <Icon name="pen" size={14} />
              Blog
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`}>
              <Icon name="mail" size={14} />
              Email
            </a>
          )}
        </div>
      )}
    </article>
  );
};

export default WorkDetailPage;
