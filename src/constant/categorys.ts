export const categories = ["ALL", "GAME", "MOBILE", "WEB", "APP"] as const;

export type CategoryType = (typeof categories)[number];
