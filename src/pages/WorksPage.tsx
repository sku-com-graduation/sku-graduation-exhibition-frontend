import type { CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useExhibitionYear } from "@src/app/YearContext";
import { Icon } from "@components/site/Icon";
import { TeamImage } from "@components/exhibition/TeamImage";
import { CATEGORY_ORDER, categoryLabel } from "@src/features/exhibition/categories";
import { useProjects } from "@src/features/exhibition/queries";
import type { IProject } from "@interface";
import styles from "./WorksPage.module.css";

type View = "grid" | "list";

/** 카드가 차례로 떠오르는 간격. 너무 길어지지 않도록 앞쪽 몇 개에만 준다 */
const stagger = (i: number) => ({ animationDelay: `${Math.min(i, 8) * 40}ms` }) as CSSProperties;

const WorksPage = () => {
  const { year } = useExhibitionYear();
  const { data: projects = [], isPending } = useProjects(year);
  const [params, setParams] = useSearchParams();

  const rawCategory = params.get("category");
  const category = CATEGORY_ORDER.find((c) => c === rawCategory) ?? "ALL";
  const query = params.get("q") ?? "";
  const view: View = params.get("view") === "list" ? "list" : "grid";

  const update = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  const needle = query.trim().toLowerCase();
  const works = projects.filter(
    (p) =>
      (category === "ALL" || p.category === category) &&
      (!needle || p.teamName.toLowerCase().includes(needle) || (p.title ?? "").toLowerCase().includes(needle)),
  );

  const tabs = [
    { key: "ALL", label: "전체", count: projects.length },
    ...CATEGORY_ORDER.map((c) => ({ key: c, label: categoryLabel(c), count: projects.filter((p) => p.category === c).length })),
  ];
  // 필터가 바뀔 때마다 목록을 새로 그려 떠오르는 효과를 다시 보여준다
  const listKey = `${category}|${needle}|${view}`;

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>
          작품 <span className={styles.total}>{isPending ? "" : projects.length}</span>
        </h1>
        <p className={styles.note}>팀명 가나다순</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="분야 필터">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={styles.tab}
              aria-pressed={category === t.key}
              onClick={() => update("category", t.key === "ALL" ? null : t.key)}
            >
              {t.label}
              <sup>{t.count}</sup>
            </button>
          ))}
        </div>
        <div className={styles.tools}>
          <label className={styles.search}>
            <Icon name="search" />
            <input
              type="search"
              aria-label="작품 검색"
              placeholder="제목 또는 팀명 검색"
              value={query}
              onChange={(e) => update("q", e.target.value || null)}
            />
          </label>
          <div className={styles.views} role="group" aria-label="보기 방식">
            <button type="button" aria-label="그리드 보기" aria-pressed={view === "grid"} onClick={() => update("view", null)}>
              <Icon name="grid" size={18} />
            </button>
            <button type="button" aria-label="리스트 보기" aria-pressed={view === "list"} onClick={() => update("view", "list")}>
              <Icon name="list" size={18} />
            </button>
          </div>
        </div>
      </div>

      <p className={styles.result} aria-live="polite">
        {isPending ? "작품을 불러오는 중" : `${works.length}개 작품${query ? ` · “${query}” 검색` : ""}`}
      </p>

      {isPending ? (
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <strong>{year}년 작품은 준비 중입니다</strong>
          <span>작품이 등록되면 이곳에서 볼 수 있습니다.</span>
        </div>
      ) : works.length === 0 ? (
        <div className={styles.empty}>
          <strong>조건에 맞는 작품이 없습니다</strong>
          <span>다른 분야를 선택하거나 검색어를 지워 보세요.</span>
          <button type="button" className={styles.reset} onClick={() => setParams(view === "list" ? { view } : {}, { replace: true })}>
            <Icon name="reset" />
            필터 초기화
          </button>
        </div>
      ) : view === "grid" ? (
        <div key={listKey} className={styles.grid}>
          {works.map((p, i) => (
            <WorkCard key={p.uuid} year={year} project={p} style={stagger(i)} />
          ))}
        </div>
      ) : (
        <div key={listKey} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">NO</th>
                <th scope="col">이미지</th>
                <th scope="col">제목</th>
                <th scope="col">팀</th>
                <th scope="col">분야</th>
              </tr>
            </thead>
            <tbody>
              {works.map((p, i) => (
                <tr key={p.uuid} style={stagger(i)}>
                  <td className={styles.no}>{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <div className={styles.thumb}>
                      <TeamImage src={p.teamProfileImage} teamName={p.teamName} category={p.category} />
                    </div>
                  </td>
                  <td className={styles.rowTitle}>
                    <Link to={`/${year}/project/${p.uuid}`}>
                      {p.title || p.teamName}{" "}
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </td>
                  <td className={styles.muted}>{p.teamName}</td>
                  <td className={styles.small}>{categoryLabel(p.category)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

const WorkCard = ({ year, project, style }: { year: number; project: IProject; style: CSSProperties }) => (
  <Link className={styles.card} to={`/${year}/project/${project.uuid}`} style={style}>
    <div className={styles.media}>
      <div className={styles.image}>
        <TeamImage src={project.teamProfileImage} teamName={project.teamName} category={project.category} />
      </div>
      {project.title && (
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.overlayCat}>{categoryLabel(project.category)}</span>
          <span className={styles.overlayTitle}>{project.title}</span>
          <span className={styles.overlayMore}>
            작품 보기 <span className={styles.arrow}>→</span>
          </span>
        </div>
      )}
    </div>
    <div className={styles.caption}>
      <span className={styles.cat}>{categoryLabel(project.category)}</span>
      {project.title && (
        <span className={styles.capTitle}>
          <span className={styles.underline}>{project.title}</span>
        </span>
      )}
      <span className={styles.team}>
        <span className={styles.underline}>{project.teamName}</span>
      </span>
    </div>
  </Link>
);

export default WorksPage;
