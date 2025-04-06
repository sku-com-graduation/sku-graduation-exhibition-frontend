export interface IAccountResponse {
  encryptedAccountId: string;
  teamName: string;
  userEmail: string;
  recent: string;
}

export interface ICreateAccountRequest {
  teamName: string;
  category: string;
  professorName: string;
  studentInfos: {
    studentName: string;
    studentNumber: string;
    studentEmail: string;
  }[];
}
