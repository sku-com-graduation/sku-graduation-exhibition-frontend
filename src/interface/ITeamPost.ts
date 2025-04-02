export interface ITeamStudent {
  name: string;
  info: string;
  role: string;
  githubUrl: string;
  studentEmail: string;
  studentBlog: string;
  profileImage: string;
}

export interface ITeamInfo {
  category: string;
  title: string;
  content: string;
  teamProfileImage: string;
  slideImages: string[];
  posterImage: string;
  demoVideo: string;
}

export interface IprofessorInfo {
  professorImage: string;
  professorName: string;
  professorEmail: string;
  professorTenure: boolean;
}

export interface ITeamPost {
  students: ITeamStudent[];
  teamInfo: ITeamInfo;
  professorInfo: IprofessorInfo;
}
