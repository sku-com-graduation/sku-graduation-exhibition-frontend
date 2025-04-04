export const STUDENT = {
  encryptedTeamId: "팀명",
  name: "이름",
  studentNumber: "학번",
  role: "역할",
  exhibitionYear: "전시연도",
} as const;

export const TEAM = {
  encryptedProfessorId: "지도교수",
  name: "팀명",
  exhibitionYear: "전시연도",
  category: "카테고리",
} as const;

export const ACCOUNT = {
  team: "팀명",
  userEmail: "계정 아이디",
  recent: "최근 접속일",
} as const;

export const PROFESSOR = {
  name: "이름",
  email: "이메일",
  tenure: "재직 여부",
  profileImg: "프로필",
} as const;

export const ADMIN_MENUS: {
  id: "student" | "team" | "account" | "professor" | "home";
  title: string;
}[] = [
  { id: "student", title: "학생 관리" },
  { id: "team", title: "팀 관리" },
  { id: "account", title: "계정 관리" },
  { id: "professor", title: "교수 관리" },
  { id: "home", title: "홈 관리" },
];
