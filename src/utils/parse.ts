import Papa from "papaparse";

export const parseCSV = <T extends Record<string, string>>(file: File, fieldNames: (keyof T)[]): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as unknown as string[][];

        const parsed: T[] = [];

        for (const row of rawData) {
          if (!Array.isArray(row) || row.length !== fieldNames.length) {
            return reject(new Error(`형식 오류: ${fieldNames.length}개의 커럼이 필요합니다. 오류 행: ${JSON.stringify(row)}`));
          }

          const record = fieldNames.reduce((acc, key, idx) => {
            acc[key] = row[idx].trim() as T[keyof T];
            return acc;
          }, {} as T);

          parsed.push(record);
        }

        resolve(parsed);
      },
      error: (error) => reject(error),
    });
  });
};
