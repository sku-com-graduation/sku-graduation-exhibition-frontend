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
  user_email: "계정 아이디",
  recent: "최근 접속일",
} as const;

export const PROFESSOR = {
  name: "이름",
  email: "이메일",
  tenure: "재직 여부",
  profileImg: "프로필",
} as const;
