interface ITeamPostEdit {
  encryptedTeamId: string;
  title: string;
  content: string;
  category: string;
  teamProfileImage: File | string;
  demo: File | string;
  posterImg: File | string;
}

export default ITeamPostEdit;
