export interface IProject {
  uuid: string;
  encryptedTeamId: string;
  teamName: string;
  title: string | null;
  teamProfileImg: string | null;
  category: string;
}
