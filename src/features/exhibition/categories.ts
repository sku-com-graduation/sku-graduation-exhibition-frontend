import type { IProject } from "@interface";

export const CATEGORY_ORDER = ["WEB", "MOBILE", "GAME", "EMBEDDED"] as const;
export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABEL: Record<string, string> = {
  WEB: "웹",
  MOBILE: "모바일",
  GAME: "게임",
  EMBEDDED: "임베디드",
};

export const categoryLabel = (category: string) => CATEGORY_LABEL[category] ?? category;

export interface CategoryCount {
  category: Category;
  label: string;
  count: number;
}

/** 작품이 있는 분야만, 정해진 순서대로 개수와 함께 돌려준다. */
export const countByCategory = (projects: IProject[]): CategoryCount[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    count: projects.filter((p) => p.category === category).length,
  })).filter((c) => c.count > 0);
