import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FallbackPoster } from "@components/exhibition/FallbackPoster";
import kit from "@components/kit/kit.module.css";
import { Icon } from "@components/site/Icon";
import { getExhibitionConfig } from "@src/config/exhibition";
import { countByCategory } from "@src/features/exhibition/categories";
import { exhibitionKeys, useProjects } from "@src/features/exhibition/queries";
import { adminApi, adminKeys } from "../adminApi";
import { DirtyBar, notify, TabHead, type TabProps } from "../parts";
import styles from "../admin.module.css";

const UNSET = "미정";

export const SettingsTab = ({ year, onDirtyChange }: TabProps) => {
  const queryClient = useQueryClient();
  const { data: homes = [], isPending, isError } = useQuery({ queryKey: adminKeys.homes, queryFn: adminApi.homes });
  const { data: projects = [] } = useProjects(year);
  const home = homes.find((h) => h.exhibitionYear === String(year));
  const config = getExhibitionConfig(year);

  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(home?.exhibitionDate ?? "");
    setHour(home?.exhibitionHour ?? "");
  }, [home]);

  const changes = Number(date !== (home?.exhibitionDate ?? "")) + Number(hour !== (home?.exhibitionHour ?? ""));

  const save = async () => {
    setSaving(true);
    const row = { encryptedHomeId: home?.encryptedHomeId ?? "", exhibitionYear: String(year), exhibitionDate: date.trim(), exhibitionHour: hour.trim() };
    try {
      // 그해 정보가 있으면 고치고, 없으면 새로 만든다
      if (home) await adminApi.updateHome(row);
      else await adminApi.createHomes([row]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.homes }),
        queryClient.invalidateQueries({ queryKey: exhibitionKeys.homeInfo(year) }),
      ]);
      notify.ok("전시 일정을 저장했습니다. 전시 홈에 바로 반영됩니다.");
    } catch {
      notify.error("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const others = [...homes].filter((h) => h.exhibitionYear !== String(year)).sort((a, b) => Number(b.exhibitionYear) - Number(a.exhibitionYear));

  return (
    <>
      <TabHead year={year} crumb="전시 설정" title={`${year} 전시 정보`}>
        <Link className={kit.btn} to={`/${year}`}>
          <Icon name="external" />
          전시 홈에서 보기
        </Link>
      </TabHead>

      <div className={styles.settings}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>전시 일정</h2>
              <span className={styles.note}>여기서 바로 저장합니다</span>
            </div>
            {isError && <p className={styles.rowError}>전시 정보를 불러오지 못했습니다.</p>}
            <div className={styles.formRow}>
              <label className={kit.field}>
                전시 날짜
                <input className={kit.input} value={date} placeholder="예) 2026.11.12 — 11.14" disabled={isPending} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className={kit.field}>
                전시 시간
                <input className={kit.input} value={hour} placeholder="예) 10:00 — 18:00" disabled={isPending} onChange={(e) => setHour(e.target.value)} />
              </label>
            </div>
            <p className={kit.help}>비워 두면 전시 홈에 '미정'으로 보입니다. 적은 그대로 보이니 형식을 맞춰 적어 주세요.</p>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>장소 · 전시 주제 · 포스터 · 제작자</h2>
              <span className={styles.note}>설정 파일로 관리 · 서버에 저장할 곳이 없습니다</span>
            </div>
            <table className={styles.plainTable}>
              <tbody>
                <tr>
                  <th scope="row">장소</th>
                  <td>{config.place || <span className={styles.muted}>{UNSET}</span>}</td>
                </tr>
                <tr>
                  <th scope="row">전시 주제</th>
                  <td>{config.theme || <span className={styles.muted}>없음 · "{year} 졸업작품전"으로 보입니다</span>}</td>
                </tr>
                <tr>
                  <th scope="row">포스터</th>
                  <td>{config.poster || <span className={styles.muted}>없음 · 기본 포스터가 보입니다</span>}</td>
                </tr>
                <tr>
                  <th scope="row">제작자</th>
                  <td>{config.makers?.people.length ? config.makers.people.map((p) => p.name).join(", ") : <span className={styles.muted}>없음 · 제작자 띠를 숨깁니다</span>}</td>
                </tr>
              </tbody>
            </table>
            <ol className={styles.codeList}>
              <li>
                포스터 파일을 <code>public/exhibition/{year}/poster.webp</code>에 넣습니다.
              </li>
              <li>
                장소·주제·포스터 경로·제작자를 <code>src/config/exhibition.ts</code>의 <code>{year}</code> 항목에 적습니다.
              </li>
              <li>다시 빌드해 배포하면 사이트에 나타납니다.</li>
            </ol>
          </section>

          {others.length > 0 && (
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>다른 해 일정</h2>
                <span className={styles.note}>왼쪽 위에서 연도를 바꾸면 수정할 수 있습니다</span>
              </div>
              <table className={styles.plainTable}>
                <thead>
                  <tr>
                    <th>연도</th>
                    <th>날짜</th>
                    <th>시간</th>
                  </tr>
                </thead>
                <tbody>
                  {others.map((h) => (
                    <tr key={h.exhibitionYear}>
                      <td className={styles.mono}>{h.exhibitionYear}</td>
                      <td>{h.exhibitionDate || <span className={styles.muted}>{UNSET}</span>}</td>
                      <td>{h.exhibitionHour || <span className={styles.muted}>{UNSET}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>포스터</h2>
            <span className={styles.note}>{config.poster ? "등록됨" : "기본 포스터"}</span>
          </div>
          {config.poster ? (
            <img src={config.poster} alt={`${year} 포스터`} style={{ width: "100%" }} />
          ) : (
            <FallbackPoster year={year} date={date || UNSET} hour={hour || UNSET} counts={countByCategory(projects)} total={projects.length} />
          )}
          <p className={kit.help}>날짜·시간을 바꾸면 기본 포스터에도 바로 보입니다. 막대는 분야별 등록 작품 수입니다.</p>
        </aside>
      </div>

      <DirtyBar
        count={changes}
        saving={saving}
        onReset={() => {
          setDate(home?.exhibitionDate ?? "");
          setHour(home?.exhibitionHour ?? "");
        }}
        onSave={save}
        onDirtyChange={onDirtyChange}
      />
    </>
  );
};
