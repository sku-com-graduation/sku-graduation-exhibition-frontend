import { describe, expect, it } from "vitest";
import { getCurrentYear, getExhibitionYears, parseExhibitionYear, themeOf, YEAR_THEMES } from "./exhibition";

describe("getCurrentYear", () => {
  it("UTC 기준으로 새해를 판단한다", () => {
    expect(getCurrentYear(new Date("2026-12-31T23:59:59Z"))).toBe(2026);
    expect(getCurrentYear(new Date("2027-01-01T00:00:00Z"))).toBe(2027);
    // 한국 시간 2027-01-01 08:59는 아직 UTC 2026년이다
    expect(getCurrentYear(new Date("2027-01-01T08:59:00+09:00"))).toBe(2026);
  });
});

describe("getExhibitionYears", () => {
  it("2023년부터 현재 연도까지 최신순으로 만든다", () => {
    expect(getExhibitionYears(new Date("2026-10-23T00:00:00Z"))).toEqual([2026, 2025, 2024, 2023]);
  });

  it("새해가 되면 그 해가 자동으로 추가된다", () => {
    expect(getExhibitionYears(new Date("2027-01-01T00:00:00Z"))[0]).toBe(2027);
  });
});

describe("parseExhibitionYear", () => {
  const now = new Date("2026-10-23T00:00:00Z");

  it("범위 안의 네 자리 연도만 받는다", () => {
    expect(parseExhibitionYear("2026", now)).toBe(2026);
    expect(parseExhibitionYear("2023", now)).toBe(2023);
  });

  it.each(["2022", "2027", "abc", "26", "2026a", undefined, ""])("%s 는 거부한다", (value) => {
    expect(parseExhibitionYear(value, now)).toBeNull();
  });
});

describe("themeOf", () => {
  it("2026년은 Cobalt다", () => {
    expect(themeOf(2026).name).toBe("Cobalt");
  });

  it("인접한 해는 다른 테마를 쓴다", () => {
    for (let y = 2023; y < 2040; y++) expect(themeOf(y)).not.toBe(themeOf(y + 1));
  });

  it("7년마다 같은 테마로 돌아온다", () => {
    expect(themeOf(2023 + YEAR_THEMES.length)).toBe(themeOf(2023));
  });
});
