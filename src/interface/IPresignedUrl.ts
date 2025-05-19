export type FileTypeTeamPostImage = "TEAM_PROFILE" | "POSTER";
export type FileTypeTeamPostVideo = "DEMO";
export type FileTypeStudent = "STUDENT_PROFILE";
export type FileTypeProfessor = "PROFESSOR";
export type FileUploadResponseType = FileTypeTeamPostImage | FileTypeStudent | FileTypeProfessor;

export interface IPresignedUrlTeamPostRequest {
  teamUuid: string;
  imageInfos?: {
    fileType: FileTypeTeamPostImage;
    contentType: string;
    extension: string;
  }[];
  videoInfo?: { fileType: string; contentType: string; extension: string; fileSize: number; partSize: number };
}

export interface IPresignedUrlStudentRequest {
  encryptedStudentId: string;
  fileType: FileTypeStudent;
  contentType: string;
  extension: string;
}

export interface IPresignedUrlProfessorRequest {
  encryptedProfessorId: string;
  fileType: FileTypeProfessor;
  contentType: string;
  extension: string;
}

export interface IPresignedUrlResponse {
  fileType: FileUploadResponseType;
  cloudFrontUrl: string;
  s3Url: string;
}

export interface IPresignedTeamPostUrlResponse {
  images?: IPresignedUrlResponse[];
  video?: {
    key: string;
    uploadId: string;
    s3Urls: {
      partNumber: number;
      url: string;
    }[];

    cloudFrontUrl: string;
  };
}

export interface IMultipartRequest {
  key: string;
  uploadId: string;
  parts: { partNumber: number; eTag: string }[];
}
