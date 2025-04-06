export interface IStudentInfo {
  encryptedStudentId: string;
  encryptedTeamId: string | null;
  name: string;
  studentNumber: string;
  role: string;
  exhibitionYear: string;
}

export interface IStudentTeamInfo {
  encryptedTeamId: string;
  teamName: string;
}

export interface IStudentResponse {
  students: IStudentInfo[];
  teams: IStudentTeamInfo[];
}

export interface ICreateStudentRequest {
  studentName: string;
  studentNumber: string;
}
