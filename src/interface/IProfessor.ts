export default interface IProfessor {
  encryptedProfessorId: string;
  name: string;
  email: string;
  tenure: boolean;
  profileImg: File | string;
}
