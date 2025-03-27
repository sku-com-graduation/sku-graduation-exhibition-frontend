import { START_YEAR } from "@src/constant/years";

export const getYearRange = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => currentYear - i);
};
