import Papa from "papaparse";

/** 엑셀이 UTF-8로 읽도록 붙이는 표시(BOM) */
const BOM = String.fromCharCode(0xfeff);

/** CSV 파일을 칸 배열로 읽는다. 따옴표, BOM, 빈 줄을 처리하고 모든 칸을 다듬는다 */
export const readCsv = async (file: File): Promise<string[][]> => {
  const raw = await file.text();
  const text = raw.startsWith(BOM) ? raw.slice(1) : raw;
  const { data } = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  return data.map((row) => row.map((cell) => (cell ?? "").trim())).filter((row) => row.some(Boolean));
};

export const isStudentNumber = (value: string) => /^\d{6,12}$/.test(value);
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** 첫 줄이 제목 줄(학번 자리에 숫자가 아닌 글자)이면 건너뛴다 */
export const withoutHeader = (rows: string[][], numberColumn: number) =>
  rows.length > 0 && !isStudentNumber(rows[0][numberColumn] ?? "") ? rows.slice(1) : rows;

/** 양식 파일 내려받기 */
export const downloadCsv = (filename: string, lines: string[][]) => {
  const body = BOM + lines.map((l) => l.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
