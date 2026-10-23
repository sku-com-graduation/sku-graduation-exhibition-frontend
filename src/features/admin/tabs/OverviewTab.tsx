import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Icon } from "@components/site/Icon";
import { categoryLabel } from "@src/features/exhibition/categories";
import { useProjects } from "@src/features/exhibition/queries";
import { adminApi, adminKeys } from "../adminApi";
import { TabHead, type TabProps } from "../parts";
import styles from "../admin.module.css";

export const OverviewTab = ({ year, go }: TabProps) => {
  const students = useQuery({ queryKey: adminKeys.students(year), queryFn: () => adminApi.students(year) });
  const teams = useQuery({ queryKey: adminKeys.teams(year), queryFn: () => adminApi.teams(year) });
  const accounts = useQuery({ queryKey: adminKeys.accounts(year), queryFn: () => adminApi.accounts(year) });
  const professors = useQuery({ queryKey: adminKeys.professors, queryFn: adminApi.professors });
  const { data: projects = [], isPending } = useProjects(year);

  const neverLoggedIn = accounts.data?.filter((a) => !a.recent).length ?? 0;
  const done = projects.filter((p) => p.title && p.teamProfileImage).length;
  const pct = projects.length ? Math.round((done / projects.length) * 100) : 0;
  const n = (v: number | undefined) => (v === undefined ? "—" : v);

  const kpis = [
    { label: "TEAMS", value: n(teams.data?.teams.length), sub: "팀 관리로 이동", tab: "teams" as const },
    { label: "STUDENTS", value: n(students.data?.students.length), sub: `팀 없는 학생 ${students.data?.students.filter((s) => !s.encryptedTeamId).length ?? "—"}명`, tab: "students" as const },
    { label: "ACCOUNTS", value: n(accounts.data?.length), sub: `접속 기록 없음 ${neverLoggedIn}팀`, tab: "accounts" as const },
    { label: "PROFESSORS", value: n(professors.data?.length), sub: `재직 ${professors.data?.filter((p) => p.tenure).length ?? "—"}명`, tab: "professors" as const },
  ];

  return (
    <>
      <TabHead year={year} crumb="개요" title="전시 운영 현황" />
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <button key={k.label} type="button" className={styles.kpi} onClick={() => go(k.tab)}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiSub}>{k.sub}</span>
          </button>
        ))}
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>작품 등록 현황</h2>
          <span className={styles.note}>제목과 대표 이미지를 모두 등록한 팀</span>
        </div>
        <div className={styles.meter} aria-hidden="true">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className={styles.note}>
          {isPending ? "불러오는 중" : projects.length === 0 ? `${year}년 팀이 아직 없습니다.` : `${projects.length}팀 중 ${done}팀이 제목과 대표 이미지를 모두 등록했습니다.${done < projects.length ? " 미등록 팀에 연락이 필요합니다." : ""}`}
        </span>
        {projects.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.plainTable}>
              <thead>
                <tr>
                  <th>팀</th>
                  <th>분야</th>
                  <th>작품 제목</th>
                  <th>대표 이미지</th>
                  <th>
                    <span className="visually-hidden">이동</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...projects]
                  .sort((a, b) => Number(!!(a.title && a.teamProfileImage)) - Number(!!(b.title && b.teamProfileImage)))
                  .map((p) => (
                    <tr key={p.uuid}>
                      <td className={styles.strong}>{p.teamName}</td>
                      <td>{categoryLabel(p.category)}</td>
                      <td>{p.title ? p.title : <span className={styles.badge} data-tone="warn">미등록</span>}</td>
                      <td>
                        {p.teamProfileImage ? (
                          <span className={styles.badge} data-tone="ok">
                            등록
                          </span>
                        ) : (
                          <span className={styles.badge} data-tone="warn">
                            미등록
                          </span>
                        )}
                      </td>
                      <td>
                        <Link to={`/${year}/project/${p.uuid}/edit`} aria-label={`${p.teamName} 작품 수정`}>
                          <Icon name="pen" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};
