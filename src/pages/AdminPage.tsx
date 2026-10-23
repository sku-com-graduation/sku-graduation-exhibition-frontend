import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useExhibitionYear } from "@src/app/YearContext";
import { Icon, type IconName } from "@components/site/Icon";
import { YearSelect } from "@components/site/YearSelect";
import { useSession } from "@src/features/auth/useSession";
import { adminApi, adminKeys } from "@src/features/admin/adminApi";
import { AccountsTab } from "@src/features/admin/tabs/AccountsTab";
import { OverviewTab } from "@src/features/admin/tabs/OverviewTab";
import { ProfessorsTab } from "@src/features/admin/tabs/ProfessorsTab";
import { SettingsTab } from "@src/features/admin/tabs/SettingsTab";
import { StudentsTab } from "@src/features/admin/tabs/StudentsTab";
import { TeamsTab } from "@src/features/admin/tabs/TeamsTab";
import { useLeaveGuard } from "@src/features/teamEdit/useLeaveGuard";
import styles from "@src/features/admin/admin.module.css";

export type AdminTab = "overview" | "students" | "teams" | "accounts" | "professors" | "settings";

const TABS: { id: AdminTab; label: string; icon: IconName }[] = [
  { id: "overview", label: "개요", icon: "layout" },
  { id: "students", label: "학생", icon: "user" },
  { id: "teams", label: "팀", icon: "users" },
  { id: "accounts", label: "계정", icon: "key" },
  { id: "professors", label: "교수", icon: "cap" },
  { id: "settings", label: "전시 설정", icon: "calendar" },
];

const LEAVE_MESSAGE = "저장하지 않은 변경이 있습니다. 저장하지 않고 이동하시겠습니까?";

/** 탭마다 개수를 보여준다. 탭이 이미 불러온 데이터를 함께 쓰므로 추가 요청은 처음 한 번뿐이다 */
const useCounts = (year: number) => {
  const students = useQuery({ queryKey: adminKeys.students(year), queryFn: () => adminApi.students(year) });
  const teams = useQuery({ queryKey: adminKeys.teams(year), queryFn: () => adminApi.teams(year) });
  const accounts = useQuery({ queryKey: adminKeys.accounts(year), queryFn: () => adminApi.accounts(year) });
  const professors = useQuery({ queryKey: adminKeys.professors, queryFn: adminApi.professors });
  return {
    students: students.data?.students.length,
    teams: teams.data?.teams.length,
    accounts: accounts.data?.length,
    professors: professors.data?.length,
  } as Partial<Record<AdminTab, number>>;
};

const AdminPage = () => {
  const { year } = useExhibitionYear();
  const navigate = useNavigate();
  const { logout } = useSession();
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.id === params.get("tab"))?.id ?? "overview";
  const counts = useCounts(year);
  const [dirty, setDirty] = useState(false);
  // 연도를 바꾸면 주소가 바뀌므로 화면 이동 확인이 함께 막아 준다
  const allowLeave = useLeaveGuard(dirty);

  const go = (next: AdminTab) => {
    if (next === tab) return;
    if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
    setDirty(false);
    setParams(next === "overview" ? {} : { tab: next });
  };

  const props = { year, onDirtyChange: setDirty, go };

  return (
    <div className={styles.shell}>
      <aside className={styles.side} aria-label="관리자 메뉴">
        <Link className={styles.brand} to={`/${year}`}>
          SKU CSE<span>ADMIN</span>
        </Link>
        <YearSelect value={year} align="left" onChange={(y) => navigate(`/${y}/admin${tab === "overview" ? "" : `?tab=${tab}`}`)} />
        <nav className={styles.nav}>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={styles.navItem} aria-current={tab === t.id ? "page" : undefined} onClick={() => go(t.id)}>
              <Icon name={t.icon} size={18} />
              {t.label}
              {counts[t.id] !== undefined && <span className={styles.navCount}>{counts[t.id]}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <Link className={styles.navItem} to={`/${year}`}>
            <Icon name="external" size={18} />
            전시 홈에서 보기
          </Link>
          <button
            type="button"
            className={styles.navItem}
            onClick={async () => {
              if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
              allowLeave();
              await logout();
              navigate(`/${year}`);
            }}
          >
            <Icon name="logout" size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {tab === "overview" && <OverviewTab {...props} />}
        {tab === "students" && <StudentsTab key={year} {...props} />}
        {tab === "teams" && <TeamsTab key={year} {...props} />}
        {tab === "accounts" && <AccountsTab key={year} {...props} />}
        {tab === "professors" && <ProfessorsTab {...props} />}
        {tab === "settings" && <SettingsTab key={year} {...props} />}
      </main>
    </div>
  );
};

export default AdminPage;
