import axios, { type AxiosResponse } from "axios";
import { getPresignedUrlStudent, getPresignedUrlTeamPost, postMultipartComplete } from "@api/presignedUrl";
import { putTeampost, putTeamStudent } from "@api/teamPost";
import type { ITeamPostEditStudent } from "@interface";
import type { IPresignedUrlTeamPostRequest } from "src/interface/IPresignedUrl";
import { extractFilenameFromUrl, mimeToExt, urlToFile } from "@utils/File";

/**
 * 팀 작품 저장. 요청 순서와 본문은 기존 수정 화면과 똑같이 유지한다(서버 API를 바꿀 수 없다).
 * 1) 새 파일이 있으면 업로드 주소를 받아 S3에 직접 올린다. 영상은 10MB 단위 멀티파트.
 * 2) 작품 정보를 FormData로 저장한다. 파일 값이 ""이면 삭제, 그 밖에는 업로드(기존 주소 유지 포함).
 * 3) 바뀐 학생 프로필만 저장한다. 새 사진이면 업로드 후 주소를 보낸다.
 */

/** 파일 칸의 값: 새로 고른 파일, 기존 주소, 또는 ""(삭제·없음) */
export type MediaValue = File | string;

export interface TeamPostForm {
  title: string;
  content: string;
  category: string;
  teamProfileImage: MediaValue;
  demoVideo: MediaValue;
  posterImage: MediaValue;
}

const PART_SIZE = 10 * 1024 * 1024;

export const isStudentModified = (original: ITeamPostEditStudent, edited: ITeamPostEditStudent): boolean =>
  original.githubUrl !== edited.githubUrl ||
  original.info !== edited.info ||
  original.profileImage !== edited.profileImage ||
  original.studentBlog !== edited.studentBlog ||
  original.studentEmail !== edited.studentEmail;

interface SaveParams {
  teamUuid: string;
  form: TeamPostForm;
  students: ITeamPostEditStudent[];
  originalStudents: ITeamPostEditStudent[];
  /** 0~100. 새로 올리는 파일 전체 크기 기준 */
  onProgress: (percent: number) => void;
}

export const saveTeamPost = async ({ teamUuid, form, students, originalStudents, onProgress }: SaveParams) => {
  let totalBytes = 0;
  let uploadedBytes = 0;

  const uploadWithProgress = async (url: string, file: Blob): Promise<AxiosResponse> => {
    let prevLoaded = 0;
    return axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (event) => {
        uploadedBytes += event.loaded - prevLoaded;
        prevLoaded = event.loaded;
        onProgress(totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 100);
      },
    });
  };

  onProgress(0);

  // 1. 새로 고른 파일만 분리
  const teamProfileFile = form.teamProfileImage instanceof File ? form.teamProfileImage : null;
  const demoFile = form.demoVideo instanceof File ? form.demoVideo : null;
  const posterFile = form.posterImage instanceof File ? form.posterImage : null;

  if (teamProfileFile) totalBytes += teamProfileFile.size;
  if (posterFile) totalBytes += posterFile.size;
  if (demoFile) totalBytes += demoFile.size;

  const imageInfos: NonNullable<IPresignedUrlTeamPostRequest["imageInfos"]> = [];
  if (teamProfileFile) imageInfos.push({ fileType: "TEAM_PROFILE", contentType: teamProfileFile.type, extension: mimeToExt(teamProfileFile.type) });
  if (posterFile) imageInfos.push({ fileType: "POSTER", contentType: posterFile.type, extension: mimeToExt(posterFile.type) });

  const videoInfo = demoFile
    ? { fileType: "DEMO", contentType: demoFile.type, extension: mimeToExt(demoFile.type), fileSize: demoFile.size, partSize: PART_SIZE }
    : { fileType: "NONE", contentType: "", extension: "", fileSize: 0, partSize: 0 };

  const presignedUrls = await getPresignedUrlTeamPost({ teamUuid, imageInfos, videoInfo });
  const videoUploadInfo = presignedUrls.video;
  const imageUploadInfos = presignedUrls.images ?? [];

  const uploadedMap = new Map<string, string>();
  imageUploadInfos.forEach((item: { fileType: string; cloudFrontUrl: string }) => uploadedMap.set(item.fileType, item.cloudFrontUrl));
  if (videoUploadInfo) uploadedMap.set("DEMO", videoUploadInfo.cloudFrontUrl);

  // 2-1. 영상: 멀티파트 업로드 후 완료 요청
  if (videoUploadInfo && demoFile) {
    const parts = videoUploadInfo.s3Urls as { partNumber: number; url: string }[];
    const partETags = await Promise.all(
      parts.map(async ({ partNumber, url }) => {
        const start = (partNumber - 1) * PART_SIZE;
        const blob = demoFile.slice(start, Math.min(start + PART_SIZE, demoFile.size));
        const res = await uploadWithProgress(url, blob);
        const rawETag: string = res?.headers?.etag || res?.headers?.ETag;
        return { partNumber, eTag: rawETag.replace(/"/g, "") };
      }),
    );
    await postMultipartComplete({ key: videoUploadInfo.key, uploadId: videoUploadInfo.uploadId, parts: partETags });
  }

  // 2-2. 이미지: 한 번에 PUT
  await Promise.all(
    imageUploadInfos.map(async (item: { fileType: string; s3Url: string }) => {
      const file = item.fileType === "TEAM_PROFILE" ? teamProfileFile : item.fileType === "POSTER" ? posterFile : null;
      if (file) await uploadWithProgress(item.s3Url, file);
    }),
  );

  // 3. 작품 정보
  const media = (key: "TEAM_PROFILE" | "DEMO" | "POSTER", value: MediaValue) => uploadedMap.get(key) ?? (typeof value === "string" ? value : "");
  const formData = new FormData();
  formData.append("teamUuid", teamUuid);
  formData.append("title", form.title || "");
  formData.append("content", form.content || "");
  formData.append("category", form.category || "");
  formData.append("teamProfileImage", media("TEAM_PROFILE", form.teamProfileImage));
  formData.append("teamProfileImageOperation", form.teamProfileImage === "" ? "DELETE" : "UPLOAD");
  formData.append("demoVideo", media("DEMO", form.demoVideo));
  formData.append("demoVideoOperation", form.demoVideo === "" ? "DELETE" : "UPLOAD");
  formData.append("posterImage", media("POSTER", form.posterImage));
  formData.append("posterImageOperation", form.posterImage === "" ? "DELETE" : "UPLOAD");

  const teamPostResponse = await putTeampost(formData);

  // 4. 바뀐 학생 프로필
  const modified = students.filter((edited, i) => isStudentModified(originalStudents[i], edited));
  await Promise.all(
    modified.map(async (student) => {
      const data = new FormData();
      data.append("teamUuid", teamUuid);
      data.append("encryptedStudentId", student.encryptedStudentProfileId);
      data.append("githubUrl", student.githubUrl || "");
      data.append("info", student.info || "");
      data.append("studentBlog", student.studentBlog || "");
      data.append("studentEmail", student.studentEmail || "");

      if (!student.profileImage) {
        data.append("profileImage", "");
        data.append("profileImageOperation", "DELETE");
      } else if (student.profileImage.startsWith("blob:")) {
        const originalUrl = originalStudents.find((s) => s.encryptedStudentProfileId === student.encryptedStudentProfileId)?.profileImage;
        const file = await urlToFile(student.profileImage, extractFilenameFromUrl(originalUrl || "", "profile.jpg"));
        const { s3Url, cloudFrontUrl } = await getPresignedUrlStudent({
          encryptedStudentId: student.encryptedStudentProfileId,
          fileType: "STUDENT_PROFILE",
          contentType: file.type,
          extension: mimeToExt(file.type),
        });
        await uploadWithProgress(s3Url, file);
        data.append("profileImage", cloudFrontUrl);
        data.append("profileImageOperation", "UPLOAD");
      } else {
        // 기존 사진 주소를 그대로 둔다
        data.append("profileImage", student.profileImage);
        data.append("profileImageOperation", "UPLOAD");
      }
      await putTeamStudent(data);
    }),
  );

  onProgress(100);
  return teamPostResponse;
};
