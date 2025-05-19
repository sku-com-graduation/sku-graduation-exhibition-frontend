export const categories = ["ALL", "WEB", "MOBILE", "GAME", "EMBEDDED"] as const;

export type CategoryType = (typeof categories)[number];
