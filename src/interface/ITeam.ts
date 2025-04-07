export interface ITeamProfessorData {
  encryptedProfessorId: string;
  professorName: string;
}

export interface ITeamData {
  encryptedTeamId: string;
  encryptedProfessorId: string;
  name: string;
  exhibitionYear: number;
  category: string;
}

export interface ITeamResponse {
  teams: ITeamData[];
  professors: ITeamProfessorData[];
}
