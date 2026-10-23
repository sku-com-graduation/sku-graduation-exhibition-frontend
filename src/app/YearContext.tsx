import { createContext, useContext } from "react";
import type { YearTheme } from "@src/lib/exhibition";

export interface YearContextValue {
  year: number;
  theme: YearTheme;
}

export const YearContext = createContext<YearContextValue | null>(null);

/** RootLayout이 검증한 전시 연도와 그해 테마 */
export const useExhibitionYear = (): YearContextValue => {
  const value = useContext(YearContext);
  if (!value) throw new Error("useExhibitionYear는 RootLayout 안에서만 쓸 수 있습니다");
  return value;
};
