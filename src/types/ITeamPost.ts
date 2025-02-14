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
  students_info: ITeamStudent[];
  PostTeamInfoDTO: {
    projectName: "가상현실 아이돌 시뮬레이터";
    explanation: "뭐시기뭐시기";
    teamProfileImage: "이미지";
    slideImages: ["이미지1.jpg", "이미지2.jpg", "이미지3.jpg"];
    posterImage: string;
    demoVideo: string;
  };
}
