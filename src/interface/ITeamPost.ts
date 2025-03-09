export default interface ITeamStudent {
  name: string;
  info: string;
  role: string;
  githubUrl: string;
  studentEmail: string;
  studentBlog: string;
  profileImage: string;
}

export default interface ITeamPost {
  students: ITeamStudent[];
  teamInfo: {
    category: string;
    projectName: string;
    explanation: string;
    teamProfileImage: string;
    slideImages: string[];
    posterImage: string;
    demoVideo: string;
  };
}
