import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

/**
 * 디자인 공유용 데모. 서버 없이 예시 팀 20개로 모든 화면을 볼 수 있게 API 응답을 흉내 낸다.
 * `npm run build:demo`에서만 들어가며, 실제 배포 빌드에는 포함되지 않는다.
 * 저장·삭제 요청은 성공으로만 답하고 실제로 바꾸지 않는다.
 */

const YEAR = new Date().getUTCFullYear();
const CATS = ["WEB", "MOBILE", "GAME", "EMBEDDED"] as const;
const PROFS = ["김도현", "이서진", "박민호", "정유나"];
const FAMILY = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황"];
const GIVEN = ["하늘", "서준", "지우", "도윤", "하은", "민재", "서연", "예준", "수아", "지호", "유진", "현우", "채원", "건우", "다인", "시우"];

const TEAMS: [string, string, string][] = [
  ["스페이스링크", "캠퍼스 공간 예약을 한 번에", "강의실, 스터디룸, 동아리방을 한 화면에서 찾고 예약합니다. 실시간 빈자리와 QR 입실 확인으로 노쇼를 줄였습니다."],
  ["모아", "흩어진 학과 공지를 한곳에", "학과 홈페이지, 단톡방, 메일에 흩어진 공지를 모아 요약하고 마감일을 알려 주는 앱입니다."],
  ["픽셀러너", "도트 그래픽 러닝 액션", "리듬에 맞춰 장애물을 넘는 2D 러닝 게임입니다. 스테이지 편집기로 직접 맵을 만들 수 있습니다."],
  ["그린팜", "스마트 화분 관리 키트", "토양 수분과 조도를 측정해 물 줄 때를 알려 주는 IoT 화분입니다. 아두이노와 앱이 함께 동작합니다."],
  ["오늘의식단", "학식 메뉴 추천과 리뷰", "학생식당 메뉴를 사진과 별점으로 공유하고 취향에 맞는 메뉴를 추천합니다."],
  ["버스온", "교내 셔틀 실시간 위치", "셔틀버스 위치와 도착 예정 시간을 지도에서 확인합니다. 혼잡도도 함께 보여 줍니다."],
  ["던전메이커", "협동 로그라이크 던전", "최대 4명이 함께 무작위 던전을 탐험하는 온라인 협동 게임입니다."],
  ["세이프워크", "야간 귀갓길 동행 서비스", "늦은 귀갓길에 친구와 위치를 공유하고 위험 상황에서 바로 신고할 수 있습니다."],
  ["코드리뷰어", "AI 코드 리뷰 도우미", "과제 코드를 올리면 스타일과 버그 가능성을 짚어 주는 학습용 웹 서비스입니다."],
  ["핏메이트", "운동 기록과 루틴 공유", "운동 기록을 자동으로 정리하고 친구와 루틴을 공유하는 모바일 앱입니다."],
  ["사운드스케이프", "소리로 길을 찾는 퍼즐", "시각 대신 소리 단서로 탈출하는 3D 퍼즐 게임입니다. 접근성을 고려해 만들었습니다."],
  ["에어체크", "강의실 공기질 모니터", "이산화탄소와 미세먼지를 측정해 환기 시점을 알려 주는 센서 보드와 대시보드입니다."],
  ["북스왑", "전공책 중고 거래", "학번과 과목으로 필요한 전공책을 찾아 교내에서 안전하게 거래합니다."],
  ["타임라인", "팀 프로젝트 일정 관리", "팀원별 할 일과 마감을 타임라인으로 보여 주고 회의록을 자동 정리합니다."],
  ["스타포지", "우주 개척 전략 시뮬레이션", "자원을 모아 행성을 개척하는 턴제 전략 게임입니다."],
  ["스마트락", "얼굴 인식 사물함", "얼굴 인식으로 열리는 공용 사물함입니다. 사용 기록을 앱으로 확인합니다."],
  ["마음일기", "감정 기록 다이어리", "하루의 감정을 색으로 기록하고 한 달의 흐름을 돌아보는 앱입니다."],
  ["클래스맵", "시간표 기반 동선 안내", "시간표를 넣으면 강의실 사이 최적 동선과 이동 시간을 알려 줍니다."],
  ["리듬히어로", "모바일 리듬 액션", "손가락 제스처로 즐기는 리듬 게임입니다. 학과 밴드 동아리의 곡을 담았습니다."],
  ["드론가드", "캠퍼스 순찰 드론", "정해진 경로를 자율 비행하며 이상 상황을 감지하는 드론 시스템입니다."],
];

/** 예시 이미지는 넣지 않는다. 화면은 이미지가 없을 때의 기본 디자인으로 보인다 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const art = (..._args: unknown[]): string => "";

const name = (n: number) => FAMILY[n % FAMILY.length] + GIVEN[(n * 7) % GIVEN.length];

const teams = TEAMS.map(([teamName, title, content], i) => {
  const hasImage = i % 5 !== 3;
  const size = 3 + (i % 2);
  const students = Array.from({ length: size }, (_, k) => {
    const n = i * 4 + k;
    return {
      encryptedStudentProfileId: `S-${i}-${k}`,
      name: name(n),
      info: k === 0 ? "기획과 프론트엔드를 맡았습니다." : ["백엔드와 데이터베이스를 맡았습니다.", "디자인과 사용자 조사를 맡았습니다.", "하드웨어와 펌웨어를 맡았습니다."][k % 3],
      role: k === 0 ? "LEADER" : "MEMBER",
      githubUrl: k < 2 ? "https://github.com/" : "",
      studentEmail: `student${n}@example.com`,
      studentBlog: k === 0 ? "https://velog.io/" : "",
      profileImage: k % 2 === 0 ? art(n, 400, 500) : "",
    };
  });
  return {
    uuid: `demo-team-${String(i + 1).padStart(2, "0")}`,
    encryptedTeamId: `T-${i}`,
    teamName,
    title: i === 7 ? null : title,
    category: CATS[i % 4],
    teamProfileImage: hasImage ? art(i, 800, 800, teamName) : null,
    content,
    slideImages: i % 3 === 0 ? [art(i + 1, 1200, 900, "화면 1"), art(i + 2, 1200, 900, "화면 2"), art(i + 3, 1200, 900, "화면 3")] : [],
    posterImage: i % 2 === 0 ? art(i + 4, 900, 1200, `${teamName} 포스터`) : null,
    professor: PROFS[i % PROFS.length],
    students,
  };
});

const projects = teams.map(({ uuid, encryptedTeamId, teamName, title, category, teamProfileImage }) => ({ uuid, encryptedTeamId, teamName, title, category, teamProfileImage }));

const routes: [RegExp, (cfg: InternalAxiosRequestConfig, m: RegExpMatchArray) => unknown][] = [
  [/\/public\/home\/search\/info\?year=(\d+)/, (_, m) => (Number(m[1]) === YEAR ? { encryptedHomeId: "H", exhibitionYear: String(YEAR), exhibitionDate: `${YEAR}.11.12 — 11.14`, exhibitionHour: "10:00 — 18:00" } : null)],
  [/\/public\/team\/search\/teamPost\?year=(\d+)/, (_, m) => (Number(m[1]) === YEAR ? projects : [])],
  [
    /\/public\/post\/search/,
    (cfg) => {
      const uuid = JSON.parse(cfg.data ?? "{}").teamUuid;
      const t = teams.find((x) => x.uuid === uuid);
      if (!t) throw Object.assign(new Error("not found"), { status: 404 });
      return {
        students: t.students,
        teamInfo: { teamUuid: t.uuid, title: t.title, content: t.content, category: t.category, teamProfileImage: t.teamProfileImage, slideImages: t.slideImages, posterImage: t.posterImage, demoVideo: null },
        professorInfo: { professorImage: "", professorName: t.professor, professorEmail: "professor@example.com", professorTenure: true },
      };
    },
  ],
  [/\/public\/account\/login/, () => ({ teamName: "관리자", role: "ADMIN", uuid: "" })],
  [
    /\/user\/post\/edit\/search/,
    (cfg) => {
      const t = teams.find((x) => x.uuid === String(cfg.data).replace(/"/g, "")) ?? teams[0];
      return { title: t.title ?? "", content: t.content, category: t.category, teamProfileImage: t.teamProfileImage ?? "", slideImages: t.slideImages, posterImage: t.posterImage ?? "", demoVideo: "", students: t.students };
    },
  ],
  [
    /\/admin\/student\/search/,
    () => ({
      students: teams.flatMap((t) => t.students.map((s, k) => ({ encryptedStudentId: s.encryptedStudentProfileId, encryptedTeamId: t.encryptedTeamId, name: s.name, studentNumber: `${YEAR - 4}0${String(teams.indexOf(t) * 4 + k).padStart(5, "0")}`, role: s.role, exhibitionYear: String(YEAR) }))),
      teams: teams.map((t) => ({ encryptedTeamId: t.encryptedTeamId, teamName: t.teamName })),
    }),
  ],
  [
    /\/admin\/team\/search\/teamInfo/,
    () => ({
      teams: teams.map((t) => ({ encryptedTeamId: t.encryptedTeamId, encryptedProfessorId: `P-${PROFS.indexOf(t.professor)}`, name: t.teamName, exhibitionYear: YEAR, category: t.category })),
      professors: PROFS.map((p, i) => ({ encryptedProfessorId: `P-${i}`, professorName: p })),
    }),
  ],
  [/\/admin\/account\/search/, () => teams.map((t, i) => ({ encryptedAccountId: `A-${i}`, teamName: t.teamName, userEmail: t.students[0].studentEmail, recent: i % 4 === 0 ? null : `${YEAR}-10-${String(10 + (i % 18)).padStart(2, "0")} 14:2${i % 10}` }))],
  [/\/admin\/account\/regist\/info/, () => ({ professors: PROFS.map((professorName) => ({ professorName })), students: [{ studentName: "홍길동", studentNumber: `${YEAR - 4}099001`, studentEmail: "" }] })],
  [/\/admin\/professor\/search/, () => PROFS.map((p, i) => ({ encryptedProfessorId: `P-${i}`, name: p, email: `prof${i}@example.com`, tenure: i !== 3, profileImage: i % 2 === 0 ? art(i + 9, 300, 300) : "" }))],
  [/\/admin\/home\/search\/infos/, () => [YEAR, YEAR - 1].map((y) => ({ encryptedHomeId: `H-${y}`, exhibitionYear: String(y), exhibitionDate: `${y}.11.12 — 11.14`, exhibitionHour: "10:00 — 18:00" }))],
];

export const demoAdapter: AxiosAdapter = async (config) => {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toUpperCase();
  await new Promise((r) => setTimeout(r, 150));
  const reply = (status: number, data: unknown): AxiosResponse => ({ data, status, statusText: String(status), headers: {}, config });
  for (const [pattern, handler] of routes) {
    const m = url.match(pattern);
    if (!m) continue;
    try {
      return reply(200, handler(config, m));
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500;
      throw Object.assign(new Error(`Request failed with status code ${status}`), { config, response: reply(status, { error: "데모" }) });
    }
  }
  if (method !== "GET") return reply(200, { message: "데모 화면에서는 저장되지 않습니다." });
  return reply(200, []);
};
