export default interface IProject {
  uuid: string;
  encryptedTeamId: string;
  teamName: string;
  title: string | null;
  teamProfileImage: string | null;
  category: string;
}
