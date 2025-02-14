export interface ITeamStudent {
  name: string;
  info: string;
  role: string;
  githubUrl: string;
  studentEmail: string;
  studentBlog: string;
  profileImage: string;
}

export interface ITeamPost {
  students: ITeamStudent[];
  PostTeamInfoDTO: {
    projectName: string;
    explanation: string;
    teamProfileImage: string;
    slideImages: string[];
    posterImage: string;
    demoVideo: string;
  };
}
