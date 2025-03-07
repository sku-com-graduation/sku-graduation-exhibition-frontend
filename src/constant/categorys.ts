export const categories = ["ALL", "GAME", "MOBILE", "WEB"] as const;

export type CategoryType = (typeof categories)[number];
