export interface IStudentResponseInfo {
  encryptedStudentId: string;
  encryptedTeamId: string | null;
  name: string;
  studentNumber: string;
  role: string;
  exhibitionYear: string;
}

export interface IStudentResponseTeamInfo {
  encryptedTeamId: string;
  teamName: string;
}

export interface IStudentResponse {
  students: IStudentResponseInfo[];
  teams: IStudentResponseTeamInfo[];
}

export interface IStudentRequest {
  studentName: string;
  studentNumber: string;
}
