export interface IAccountResponse {
  encryptedAccountId: string;
  teamName: string;
  userEmail: string;
  recent: string;
}

export interface IAccountRequestStudentInfo {
  studentName: string;
  studentNumber: string;
  studentEmail: string;
}

export interface IAccountRequest {
  teamName: string;
  category: string;
  professorName: string;
  studentInfos: IAccountRequestStudentInfo[];
}
