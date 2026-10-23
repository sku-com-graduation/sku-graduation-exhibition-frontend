import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useExhibitionYear } from "@src/app/YearContext";
import { useSession } from "@src/features/auth/useSession";
import { getCurrentYear, getExhibitionYears, themeOf } from "@src/lib/exhibition";
import { Icon } from "./Icon";
import { LoginDialog } from "./LoginDialog";
import { YearSelect } from "./YearSelect";
import styles from "./SiteHeader.module.css";

/** 연도를 바꿀 때 같은 종류의 화면으로 이동한다. 작품 상세는 연도마다 팀이 다르므로 그 해 홈으로 보낸다. */
export const pathForYear = (pathname: string, year: number): string => {
  const [, , section, uuid] = pathname.split("/");
  if (section === "admin") return `/${year}/admin`;
  if (section === "project" && !uuid) return `/${year}/project`;
  return `/${year}`;
};

export const SiteHeader = () => {
  const { year } = useExhibitionYear();
  const { auth, isLoggedIn, isAdmin, logout } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const changeYear = (y: number) => navigate(pathForYear(pathname, y));
  const accountHref = isAdmin ? `/${year}/admin` : `/${year}/project/${auth.uuid}`;

  const account = isLoggedIn ? (
    <div className={styles.account}>
      <Link className={styles.accountLink} to={accountHref}>
        {isAdmin ? "관리자" : auth.teamName}
      </Link>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="로그아웃"
        onClick={async () => {
          await logout();
          if (pathname.includes("/admin") || pathname.endsWith("/edit")) navigate(`/${year}`);
        }}
      >
        <Icon name="logout" />
      </button>
    </div>
  ) : (
    <button
      type="button"
      className={`${styles.iconButton} ${styles.admin}`}
      aria-label="관리자 로그인"
      data-tip="관리자 전용"
      onClick={() => setLoginOpen(true)}
    >
      <Icon name="lock" />
    </button>
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={`/${year}`} className={styles.brand}>
          <span className={styles.brandLong}>성결대학교 컴퓨터공학과 졸업작품전</span>
          <span className={styles.brandShort}>성결대 컴퓨터공학과 졸업작품전</span>
        </Link>
        <div className={styles.desktop}>
          <YearSelect value={year} onChange={changeYear} />
          {account}
        </div>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.menuButton}`}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <nav id="site-menu" className={styles.sheet} aria-label="전시 연도와 계정">
          <p className={styles.sheetLabel}>전시 연도</p>
          <div className={styles.yearChips}>
            {getExhibitionYears().map((y) => (
              <button
                key={y}
                type="button"
                className={styles.yearChip}
                aria-pressed={y === year}
                onClick={() => {
                  setMenuOpen(false);
                  if (y !== year) changeYear(y);
                }}
              >
                <span className={styles.dot} style={{ background: themeOf(y).accent }} />
                {y}
                {y === getCurrentYear() && <span className="visually-hidden">진행 중</span>}
              </button>
            ))}
          </div>
          <div className={styles.sheetFoot}>
            <span>© {getCurrentYear()} 성결대학교 컴퓨터공학과</span>
            {account}
          </div>
        </nav>
      )}

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
};
