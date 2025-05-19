import {
  IMultipartRequest,
  IPresignedTeamPostUrlResponse,
  IPresignedUrlProfessorRequest,
  IPresignedUrlResponse,
  IPresignedUrlStudentRequest,
  IPresignedUrlTeamPostRequest,
} from "src/interface/IPresignedUrl";
import api from ".";

// 팀 페이지 presigned URL 요청
export const getPresignedUrlTeamPost = async (data: IPresignedUrlTeamPostRequest) => {
  const result = await api.post(`/user/s3/presigned-url/post`, data);
  return result.data as IPresignedTeamPostUrlResponse;
};

// 멀티 파트 합치기 요청
export const postMultipartComplete = async (data: IMultipartRequest) => {
  const result = await api.post(`/user/s3/multipart/complete`, data);
  return result.status;
};

// 학생 presigned URL 요청
export const getPresignedUrlStudent = async (data: IPresignedUrlStudentRequest) => {
  const result = await api.post(`/user/s3/presigned-url/student`, data);
  return result.data as IPresignedUrlResponse;
};

// 교수 presigned URL 요청
export const getPresignedUrlProfessor = async (data: IPresignedUrlProfessorRequest) => {
  const result = await api.post(`/user/s3/presigned-url/professor`, data);
  return result.data as IPresignedUrlResponse;
};
