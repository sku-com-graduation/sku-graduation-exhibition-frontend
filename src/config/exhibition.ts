/**
 * 서버 API에 저장할 곳이 없는 연도별 전시 정보.
 * 일시·시간은 관리자 화면(홈 정보 API)에서 관리하고, 나머지는 이 파일과
 * public/exhibition/{연도}/ 폴더의 이미지로 관리한다. 바꾼 뒤에는 다시 배포한다.
 */

export interface Maker {
  name: string;
  /** 예: "기획 · 디자인" */
  role: string;
  /** public/ 기준 경로. 없으면 이름 첫 글자로 대신한다 */
  photo?: string;
  github?: string;
  email?: string;
}

export interface ExhibitionConfig {
  /** 비워 두면 "{연도} 졸업작품전"을 제목으로 쓴다 */
  theme?: string;
  /** 비워 두면 "미정"으로 표시한다 */
  place?: string;
  /** public/ 기준 경로. 없으면 작품 데이터로 만든 기본 포스터를 보여준다 */
  poster?: string;
  posterCredit?: string;
  /** 전시 소개 인용문과 출처 */
  quote?: { text: string; highlight?: string; by?: string };
  makers?: { note?: string; people: Maker[]; photos?: string[] };
}

const EXHIBITIONS: Record<number, ExhibitionConfig> = {
  2026: {
    makers: {
      people: [],
    },
  },
};

const DEFAULT_QUOTE: NonNullable<ExhibitionConfig["quote"]> = {
  text: "지난 4년간의 연구와 도전이 한 자리에 모인 전시입니다.",
  highlight: "한 자리에 모인",
};

export const getExhibitionConfig = (year: number): ExhibitionConfig => {
  const config = EXHIBITIONS[year] ?? {};
  return { ...config, quote: config.quote ?? DEFAULT_QUOTE };
};
