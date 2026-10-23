/** 첫 온라인 전시 연도. 이 해부터 현재 UTC 연도까지를 전시 연도로 본다. */
export const START_YEAR = 2023;

/** 현재 연도를 UTC 기준으로 계산한다. 1월 1일 00:00 UTC에 자동으로 다음 해로 넘어간다. */
export const getCurrentYear = (now: Date = new Date()): number => now.getUTCFullYear();

/** 최신 연도가 먼저 오도록 정렬된 전시 연도 목록 */
export const getExhibitionYears = (now: Date = new Date()): number[] => {
  const current = getCurrentYear(now);
  return Array.from({ length: current - START_YEAR + 1 }, (_, i) => current - i);
};

/** URL 파라미터가 유효한 전시 연도인지 검사한다. 숫자가 아니거나 범위를 벗어나면 null */
export const parseExhibitionYear = (value: string | undefined, now: Date = new Date()): number | null => {
  if (!value || !/^\d{4}$/.test(value)) return null;
  const year = Number(value);
  return year >= START_YEAR && year <= getCurrentYear(now) ? year : null;
};

export interface YearTheme {
  name: string;
  /** 흰 글자와 4.5:1 이상 대비를 확보한 강조색 */
  accent: string;
  /** 강조색의 옅은 배경 */
  soft: string;
}

/** 연도 순서대로 돌아가며 배정한다. 인접한 해는 겹치지 않고 2026년은 Cobalt다. */
export const YEAR_THEMES: readonly YearTheme[] = [
  { name: "Emerald", accent: "#0B7A5C", soft: "#E3F3EE" },
  { name: "Vermilion", accent: "#C2410C", soft: "#FDEDE4" },
  { name: "Violet", accent: "#6D28D9", soft: "#F1EAFD" },
  { name: "Cobalt", accent: "#1F45FC", soft: "#E8ECFF" },
  { name: "Teal", accent: "#0E7490", soft: "#E3F4F8" },
  { name: "Magenta", accent: "#BE185D", soft: "#FCE7F0" },
  { name: "Indigo", accent: "#4338CA", soft: "#ECEBFB" },
];

export const themeOf = (year: number): YearTheme => {
  const n = YEAR_THEMES.length;
  return YEAR_THEMES[(((year - START_YEAR) % n) + n) % n];
};
