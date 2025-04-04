import { START_YEAR } from "@constant/years";

export const getYearRange = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => currentYear - i);
};
