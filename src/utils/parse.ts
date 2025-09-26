import { IAccountTeamRequest, IStudentRequest } from "@interface";

export const parseStudentCSV = async (file: File): Promise<IStudentRequest[]> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  return lines.map((line, index) => {
    const [studentName, studentNumber, ...rest] = line.split(",").map((cell) => cell.trim());

    if (!studentName || !studentNumber) {
      throw new Error(`형식 오류 (행 ${index + 1}): 이름과 학번이 모두 필요합니다. 입력: ${line}`);
    }

    return { studentName, studentNumber };
  });
};

export const parseAccountCSV = async (file: File): Promise<IAccountTeamRequest[]> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  return lines.map((line) => {
    const cells = line.split(",");

    const [teamName, category, professorName, ...rest] = cells;
    const studentInfos = [];

    for (let i = 0; i < rest.length; i += 3) {
      const [studentName, studentNumber, studentEmail] = rest.slice(i, i + 3);
      if (studentName && studentNumber && studentEmail) {
        studentInfos.push({ studentName, studentNumber, studentEmail });
      }
    }

    return {
      teamName,
      category,
      professorName,
      studentInfos,
    };
  });
};
