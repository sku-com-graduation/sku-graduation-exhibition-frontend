export interface ITeamPostEditStudent {
  encryptedStudentProfileId: string;
  name: string;
  info: string;
  role: string;
  githubUrl: string;
  studentEmail: string;
  studentBlog: string;
  profileImage: string;
}

export interface ITeamPostEdit {
  title: string;
  content: string;
  category: string;
  teamProfileImage: string;
  slideImages: string[];
  posterImage: string;
  demoVideo: string;
  students: ITeamPostEditStudent[];
}
