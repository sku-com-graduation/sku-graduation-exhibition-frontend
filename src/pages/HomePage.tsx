import { Link } from "react-router-dom";
import { useExhibitionYear } from "@src/app/YearContext";
import { Icon } from "@components/site/Icon";
import { FallbackPoster } from "@components/exhibition/FallbackPoster";
import { Marquee } from "@components/exhibition/Marquee";
import { TeamImage } from "@components/exhibition/TeamImage";
import { getExhibitionConfig, type ExhibitionConfig } from "@src/config/exhibition";
import { categoryLabel, countByCategory } from "@src/features/exhibition/categories";
import { useHomeInfo, useProjects } from "@src/features/exhibition/queries";
import { getExhibitionYears, themeOf } from "@src/lib/exhibition";
import type { IProject } from "@interface";
import styles from "./HomePage.module.css";

const UNSET = "미정";
/** 띠 한 줄이 화면 너비보다 짧으면 이음새가 보이므로 이 개수까지 반복해 채운다 */
const MIN_PER_ROW = 8;

const fillRow = (list: IProject[]) => {
  if (list.length === 0) return list;
  const out = [...list];
  while (out.length < MIN_PER_ROW) out.push(...list);
  return out;
};

const HomePage = () => {
  const { year } = useExhibitionYear();
  const config = getExhibitionConfig(year);
  const { data: projects = [], isPending } = useProjects(year);
  const { data: info } = useHomeInfo(year);

  const counts = countByCategory(projects);
  const date = info?.exhibitionDate || UNSET;
  const hour = info?.exhibitionHour || UNSET;
  const place = config.place || UNSET;

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.lede}>
          <p className={styles.kicker}>성결대학교 컴퓨터공학과</p>
          {config.theme ? (
            <div className={styles.themed}>
              <h1 className={styles.title}>{config.theme}</h1>
              <p className={styles.subtitle}>
                <span className={styles.accent}>{year}</span> 졸업작품전
              </p>
            </div>
          ) : (
            <h1 className={styles.title}>
              <span className={styles.accent}>{year}</span>
              <br />
              졸업작품전
            </h1>
          )}
          <dl className={styles.info}>
            {[
              ["일시", date],
              ["시간", hour],
              ["장소", place],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd data-unset={value === UNSET || undefined}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.cta}>
            <p>
              {isPending
                ? " "
                : projects.length > 0
                  ? `${projects.length}개 팀의 ${counts.map((c) => c.label).join(", ")} 졸업작품을 소개합니다.`
                  : "작품을 준비하고 있습니다. 곧 이곳에서 만나보실 수 있습니다."}
            </p>
            <Link className={styles.allWorks} to={`/${year}/project`}>
              전체 작품
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
        <figure className={styles.poster}>
          {config.poster ? (
            <>
              <img src={config.poster} alt={`${year} 졸업작품전 포스터`} />
              {config.posterCredit && <figcaption>포스터 디자인 {config.posterCredit}</figcaption>}
            </>
          ) : (
            <FallbackPoster year={year} date={date} hour={hour} counts={counts} total={projects.length} />
          )}
        </figure>
      </section>

      <WorksSection year={year} projects={projects} isPending={isPending} />
      <About quote={config.quote!} />
      <Archive year={year} />
      <Makers makers={config.makers} />
    </main>
  );
};

const WorksSection = ({ year, projects, isPending }: { year: number; projects: IProject[]; isPending: boolean }) => {
  const counts = countByCategory(projects);
  const twoRows = projects.length >= 6;
  const rowA = twoRows ? projects.filter((_, i) => i % 2 === 0) : projects;
  const rowB = twoRows ? projects.filter((_, i) => i % 2 === 1) : [];

  return (
    <section className={styles.works} aria-labelledby="works-title">
      <div className={`${styles.worksHead} reveal`}>
        <h2 id="works-title" className={styles.h2}>
          작품
        </h2>
        {projects.length > 0 && (
          <nav className={styles.filters} aria-label="분야별 작품 보기">
            <Link to={`/${year}/project`}>
              전체<sup>{projects.length}</sup>
            </Link>
            {counts.map((c) => (
              <Link key={c.category} to={`/${year}/project?category=${c.category}`}>
                {c.label}
                <sup>{c.count}</sup>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {isPending ? (
        <div className={styles.skeleton} aria-busy="true" aria-label="작품을 불러오는 중">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className={styles.empty}>
          <Icon name="calendar" size={18} />
          {year}년 작품은 준비 중입니다.
        </p>
      ) : (
        <div className={styles.rows}>
          <Marquee speed={30} label="작품 둘러보기">
            {fillRow(rowA).map((p, i) => (
              <WorkCard key={`${p.uuid}-${i}`} year={year} project={p} size="large" />
            ))}
          </Marquee>
          {rowB.length > 0 && (
            <Marquee speed={18} direction="right" label="작품 둘러보기 두 번째 줄">
              {fillRow(rowB).map((p, i) => (
                <WorkCard key={`${p.uuid}-${i}`} year={year} project={p} size="small" />
              ))}
            </Marquee>
          )}
        </div>
      )}
    </section>
  );
};

const WorkCard = ({ year, project, size }: { year: number; project: IProject; size: "large" | "small" }) => (
  <Link className={styles.card} data-size={size} to={`/${year}/project/${project.uuid}`}>
    <div className={styles.cardImage}>
      <TeamImage src={project.teamProfileImage} teamName={project.teamName} category={project.category} />
    </div>
    <span className={styles.cardTitle}>{project.title || project.teamName}</span>
    {size === "large" && (
      <span className={styles.cardMeta}>
        {project.teamName} · {categoryLabel(project.category)}
      </span>
    )}
  </Link>
);

const About = ({ quote }: { quote: NonNullable<ExhibitionConfig["quote"]> }) => {
  const [before, after] = quote.highlight ? quote.text.split(quote.highlight) : [quote.text];
  return (
    <section className={styles.about} aria-label="전시 소개">
      <div className={styles.aboutInner}>
        <p className={`${styles.quote} reveal`}>
          “{before}
          {quote.highlight && after !== undefined && (
            <>
              <mark>{quote.highlight}</mark>
              {after}
            </>
          )}
          ”
        </p>
        {(quote.body || quote.by) && (
          <div className={`${styles.aboutBody} reveal`}>
            {quote.body && <p>{quote.body}</p>}
            {quote.by && <p className={styles.by}>— {quote.by}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

const Archive = ({ year }: { year: number }) => {
  const others = getExhibitionYears().filter((y) => y !== year);
  if (others.length === 0) return null;
  return (
    <section className={styles.archive} aria-labelledby="archive-title">
      <div className={styles.archiveInner}>
        <h2 id="archive-title" className={`${styles.h2} reveal`}>
          지난 전시
        </h2>
        <div className={`${styles.spines} reveal`}>
          {others.map((y) => (
            <Link key={y} className={styles.spine} to={`/${y}`} style={{ background: themeOf(y).accent }} aria-label={`${y} 졸업작품전 보기`}>
              <span className={styles.spineName}>{y} 졸업작품전</span>
              <span className={styles.spineFoot}>
                <span className={styles.spineMore}>
                  <Icon name="external" />
                  {y} 전시 보기
                </span>
                <span className={styles.spineYear}>{y}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Makers = ({ makers }: { makers: ExhibitionConfig["makers"] }) => {
  if (!makers || makers.people.length === 0) return null;
  return (
    <section className={styles.makers} aria-labelledby="makers-title">
      <div className={styles.makersInner}>
        <div className={styles.makersHead}>
          <h2 id="makers-title">이 사이트를 만든 사람들</h2>
          {makers.note && <p>{makers.note}</p>}
        </div>
        {makers.photos && makers.photos.length > 0 && (
          <div className={styles.makersPhotos}>
            {makers.photos.slice(0, 3).map((src, i) => (
              <img key={src} src={src} alt="" loading="lazy" data-wide={i === 0 || undefined} />
            ))}
          </div>
        )}
        <ul className={styles.people}>
          {makers.people.map((p) => (
            <li key={p.name}>
              {p.photo ? <img className={styles.avatar} src={p.photo} alt="" loading="lazy" /> : <span className={styles.avatar}>{p.name.slice(0, 1)}</span>}
              <span className={styles.who}>
                <strong>{p.name}</strong>
                <span>{p.role}</span>
              </span>
              {p.github && (
                <a className={styles.personLink} href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} GitHub`}>
                  <Icon name="code" />
                </a>
              )}
              {p.email && (
                <a className={styles.personLink} href={`mailto:${p.email}`} aria-label={`${p.name} 이메일`}>
                  <Icon name="mail" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomePage;
