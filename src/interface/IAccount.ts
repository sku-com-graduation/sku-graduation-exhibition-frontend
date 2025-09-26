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

export interface IAccountTeamRequest {
  teamName: string;
  category: string;
  professorName: string;
  studentInfos: IAccountRequestStudentInfo[];
}

export interface IAccountRequest {
  year: number;
  registerAccounts: IAccountTeamRequest[];
}

export interface IAccountSetInfo {
  professors: {
    professorName: string;
  }[];
  students: IAccountRequestStudentInfo[];
}
