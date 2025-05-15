export type FileTypeTeamPost = "TEAM_PROFILE" | "DEMO" | "POSTER";
export type FileTypeStudent = "STUDENT_PROFILE";
export type FileTypeProfessor = "PROFESSOR";
export type FileUploadResponseType = FileTypeTeamPost | FileTypeStudent | FileTypeProfessor;

export interface IPresignedUrlTeamPostRequest {
  teamUuid: string;
  fileInfos: {
    fileType: FileTypeTeamPost;
    extension: string;
  }[];
}

export interface IPresignedUrlStudentRequest {
  encryptedStudentId: string;
  fileType: FileTypeStudent;
  extension: string;
}

export interface IPresignedUrlProfessorRequest {
  fileType: FileTypeProfessor;
  extension: string;
}

export interface IPresignedUrlResponse {
  fileType: FileUploadResponseType;
  cloudFrontUrl: string;
  s3Url: string;
}
