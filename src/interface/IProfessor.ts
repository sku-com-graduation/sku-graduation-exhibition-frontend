export interface IProfessor {
  encryptedProfessorId: string;
  name: string;
  email: string;
  tenure: boolean;
  profileImage: File | string;
}
