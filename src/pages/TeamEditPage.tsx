// 250518 업로드 퍼센트

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "@api/teamPost";
import DemoVideoEditor from "@components/DemoVideoEditor";
import { EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
import { extractFilenameFromUrl, mimeToExt, urlToFile } from "@utils/File";
import { useModal, usePrompt, useToast } from "@hooks";
import Profile from "@components/Profile";

import userEmpty from "@assets/image/user.png";
import { ITeamPostEdit, ITeamPostEditStudent } from "@interface";

import { useSpinner } from "src/hooks/useSpinner";
import Spinner from "@components/Spinner";

import {
  Container,
  SectionTitle,
  TeamIntro,
  TeamProfile,
  CharCount,
  PosterIntro,
  PosterImg,
  SaveButton,
  FileFormatNotice,
  ImageWrapper,
  Overlay,
  StudentList,
  StudentItem,
  StudentInfo,
  StudentName,
  CategorySelect,
  AddMediaButton,
  SquareMediaButton,
  PosterMediaButton,
} from "./TeamEditPage.styled";
import { getPresignedUrlStudent, getPresignedUrlTeamPost, postMultipartComplete } from "@api/presignedUrl";
import axios, { AxiosResponse } from "axios";
import { DeleteSqButton } from "@components/ui/Button";
import { IPresignedUrlTeamPostRequest } from "src/interface/IPresignedUrl";
import { categories } from "@constant/categorys";

/* ────────────────
   메인 컴포넌트
   ──────────────── */

interface IEditForm {
  title: string;
  content: string;
  category: string;
  teamProfileImage: File | string | null;
  demoVideo: File | string | null;
  posterImage: File | string | null;
}

const TeamEditPage = () => {
  const { team_uuid, year } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const totalBytesRef = useRef(0);
  const uploadedBytesRef = useRef(0);

  const [teampostEdit, setTeampostEdit] = useState<ITeamPostEdit | null>(null);
  const [editData, setEditData] = useState<IEditForm>({
    title: "",
    content: "",
    category: "",
    teamProfileImage: "",
    demoVideo: "",
    posterImage: "",
  });

  const [editedStudents, setEditedStudents] = useState<ITeamPostEditStudent[]>([]);
  const [originalStudents, setOriginalStudents] = useState<ITeamPostEditStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ITeamPostEditStudent | null>(null);
  const { openModal, closeModal, Modal } = useModal();

  // const [existingSlideImages, setExistingSlideImages] = useState<string[]>([]);
  // const [newSlideImages, setNewSlideImages] = useState<File[]>([]);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const { notifySuccess, notifyInfo, notifyError } = useToast();
  const { isLoading, setIsLoading, loadingStart, loadingStop, progress, setProgress } = useSpinner();

  const [isDirty, setIsDirty] = useState<boolean>(false);

  usePrompt(isDirty);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 팀 정보 불러오기
  const getTeampostEdit = async (team_id: string) => {
    try {
      const res = await postGetTeampostEdit(team_id);
      setTeampostEdit(res);
    } catch (error) {
      notifyError("팀 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
    }
  };

  useEffect(() => {
    if (team_uuid) {
      getTeampostEdit(team_uuid);
    }
  }, [team_uuid]);

  useEffect(() => {
    // console.log("????????????? " + JSON.stringify(teampostEdit, null, 4));
  }, [teampostEdit]);
  useEffect(() => {
    // console.log("!!!!!!!!!: " + JSON.stringify(editData, null, 4));
  }, [editData]);

  useEffect(() => {
    if (teampostEdit) {
      setEditData({
        title: teampostEdit.title,
        content: teampostEdit.content,
        category: teampostEdit.category,
        teamProfileImage: teampostEdit.teamProfileImage,
        demoVideo: teampostEdit.demoVideo,
        posterImage: teampostEdit.posterImage,
      });
      // setExistingSlideImages(teampostEdit.slideImages || []);
      setEditedStudents(teampostEdit.students);
      setOriginalStudents(teampostEdit.students);
    }
  }, [teampostEdit]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({ ...prev, [e.target.name]: file }));
      setIsDirty(true);
    }
    e.target.value = "";
  };

  const handleStudentClick = (student: ITeamPostEditStudent) => {
    setSelectedStudent(student);
    openModal();
  };

  const updateStudent = (updatedStudent: ITeamPostEditStudent) => {
    setEditedStudents((prev) =>
      prev.map((stu) =>
        stu.encryptedStudentProfileId === updatedStudent.encryptedStudentProfileId ? updatedStudent : stu
      )
    );
    setSelectedStudent(null);
    closeModal();
    setIsDirty(true);
  };

  const isStudentModified = (original: ITeamPostEditStudent, edited: ITeamPostEditStudent): boolean =>
    original.githubUrl !== edited.githubUrl ||
    original.info !== edited.info ||
    original.profileImage !== edited.profileImage ||
    original.studentBlog !== edited.studentBlog ||
    original.studentEmail !== edited.studentEmail;

  /////////////////////////////////////////////////////////////////////// 저장 버튼 클릭 시 처리 (파일/URL 처리 포함)

  const handleSave = async () => {
    const uploadWithProgress = async (url: string, file: Blob): Promise<AxiosResponse> => {
      let prevLoaded = 0;
      const res = await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (event) => {
          const diff = event.loaded - prevLoaded;
          prevLoaded = event.loaded;
          uploadedBytesRef.current += diff;
          const percent = Math.round((uploadedBytesRef.current / totalBytesRef.current) * 100);
          setProgress(percent);
        },
      });
      return res;
    };

    if (!team_uuid) return;
    loadingStart();

    setProgress(0);
    uploadedBytesRef.current = 0;
    totalBytesRef.current = 0;

    try {
      // 1. 수정된 파일만 File 객체로 분리
      const teamProfileFile = editData.teamProfileImage instanceof File ? editData.teamProfileImage : null;
      const demoFile = editData.demoVideo instanceof File ? editData.demoVideo : null;
      const posterFile = editData.posterImage instanceof File ? editData.posterImage : null;

      if (teamProfileFile) totalBytesRef.current += teamProfileFile.size;
      if (posterFile) totalBytesRef.current += posterFile.size;
      if (demoFile) totalBytesRef.current += demoFile.size;

      // console.log("teamProfileFile =", teamProfileFile ? `${teamProfileFile.name} (${teamProfileFile.type})` : "null");
      // console.log("demoFile =", demoFile ? `${demoFile.name} (${demoFile.type})` : "null");
      // console.log("posterFile =", posterFile ? `${posterFile.name} (${posterFile.type})` : "null");

      const imageInfos = [];
      if (teamProfileFile) {
        imageInfos.push({
          fileType: "TEAM_PROFILE" as const,
          contentType: teamProfileFile.type,
          extension: mimeToExt(teamProfileFile.type),
        });
      }
      if (posterFile) {
        imageInfos.push({
          fileType: "POSTER" as const,
          contentType: posterFile.type,
          extension: mimeToExt(posterFile.type),
        });
      }

      const videoInfo = {
        fileType: "NONE",
        contentType: "",
        extension: "",
        fileSize: 0,
        partSize: 0,
      };

      if (demoFile) {
        videoInfo.fileType = "DEMO";
        videoInfo.contentType = demoFile.type;
        videoInfo.extension = mimeToExt(demoFile.type);
        videoInfo.fileSize = demoFile.size;
        videoInfo.partSize = 10 * 1024 * 1024; // 10MB 단위 (예시)
      }

      const requestData: IPresignedUrlTeamPostRequest = {
        teamUuid: team_uuid,
        imageInfos,
        videoInfo,
      };
      // const requestData: IPresignedUrlTeamPostRequest = {
      //   teamUuid: team_uuid,
      //   ...(imageInfos.length > 0 && { imageInfos }),
      //   ...(videoInfo && { videoInfo }),
      // };

      // console.log("📦 requestData =", JSON.stringify(requestData, null, 4));

      const presignedUrls = await getPresignedUrlTeamPost(requestData);

      // 결과 분기
      const videoUploadInfo = presignedUrls.video;
      const imageUploadInfos = presignedUrls.images ?? [];

      // cloudFrontUrl 매핑용
      const uploadedMap = new Map<string, string>();
      imageUploadInfos.forEach((item) => uploadedMap.set(item.fileType, item.cloudFrontUrl));
      if (videoUploadInfo) uploadedMap.set("DEMO", videoUploadInfo.cloudFrontUrl);

      // 4.1 실제 S3 업로드 - 영상 (멀티파트 방식)
      if (videoUploadInfo && demoFile) {
        const uploadParts = videoUploadInfo?.s3Urls as { partNumber: number; url: string }[];
        // console.log("📦 uploadParts =", JSON.stringify(uploadParts, null, 4));

        const partETags = await Promise.all(
          uploadParts.map(async ({ partNumber, url }) => {
            const start = (partNumber - 1) * videoInfo!.partSize;
            const end = Math.min(start + videoInfo!.partSize, demoFile.size);
            const blob = demoFile.slice(start, end);

            const res = await uploadWithProgress(url, blob);
            const rawETag = res?.headers?.etag || res?.headers?.ETag;
            // const response = await axios.put(url, blob, {
            //   headers: { "Content-Type": demoFile.type },
            //   // ✅ 상태 업데이트
            //   onUploadProgress: (event) => {
            //     const percent = Math.round((event.loaded / event.total!) * 100);
            //     setProgress(percent); // ✅ 상태 업데이트
            //   },
            // });
            // // console.log(JSON.stringify(response, null, 4));

            // const rawETag = response.headers["etag"] || response.headers["ETag"];

            return {
              partNumber,
              eTag: rawETag.replace(/"/g, ""),
            };
          })
        );

        // console.log("📦 partETags =", JSON.stringify(partETags, null, 4));

        await postMultipartComplete({
          key: videoUploadInfo.key,
          uploadId: videoUploadInfo.uploadId,
          parts: partETags,
        });
      }

      // 4.2 실제 S3 업로드 - 이미지 (단일 PUT 방식)
      await Promise.all(
        imageUploadInfos.map(async (item) => {
          let file: File | null = null;
          if (item.fileType === "TEAM_PROFILE") file = teamProfileFile;
          if (item.fileType === "POSTER") file = posterFile;

          if (file) {
            await uploadWithProgress(item.s3Url, file);
            // await axios.put(item.s3Url, file, {
            //   headers: { "Content-Type": file.type },
            //   // ✅ 상태 업데이트
            //   onUploadProgress: (event) => {
            //     const percent = Math.round((event.loaded / event.total!) * 100);
            //     setProgress(percent);
            //   },
            // });
          }
        })
      );

      // 5. formData 구성
      const formData = new FormData();
      formData.append("teamUuid", team_uuid);
      formData.append("title", editData.title || "");
      formData.append("content", editData.content || "");
      formData.append("category", editData.category || "");

      // teamProfileImage
      if (uploadedMap.has("TEAM_PROFILE")) {
        formData.append("teamProfileImage", uploadedMap.get("TEAM_PROFILE")!);
      } else if (typeof editData.teamProfileImage === "string") {
        formData.append("teamProfileImage", editData.teamProfileImage);
      } else {
        formData.append("teamProfileImage", "");
      }
      formData.append("teamProfileImageOperation", editData.teamProfileImage === "" ? "DELETE" : "UPLOAD");

      // demoVideo
      formData.append(
        "demoVideo",
        uploadedMap.get("DEMO") ?? (typeof editData.demoVideo === "string" ? editData.demoVideo : "")
      );
      formData.append("demoVideoOperation", editData.demoVideo === "" ? "DELETE" : "UPLOAD");

      // posterImage
      formData.append(
        "posterImage",
        uploadedMap.get("POSTER") ?? (typeof editData.posterImage === "string" ? editData.posterImage : "")
      );
      formData.append("posterImageOperation", editData.posterImage === "" ? "DELETE" : "UPLOAD");

      // 테스트용
      // formData.append("teamProfileImagePath", `/teamPost/${team_uuid}/teamProfile_`);
      // formData.append("demoVideoPath", `/teamPost/${team_uuid}/demo_`);
      // formData.append("posterImagePath", `/teamPost/${team_uuid}/poster_`);

      // formData.forEach((v, k) => // console.log(`[formData] ${k}:`, v));

      // 6. 서버 요청
      const teamPostResponse = await putTeampost(formData);

      // 7. 수정된 학생 정보도 처리
      const modifiedStudents = editedStudents.filter((edited, index) => {
        const original = originalStudents[index];
        return isStudentModified(original, edited);
      });

      await Promise.all(
        modifiedStudents.map(async (student) => {
          const studentFormData = new FormData();
          studentFormData.append("teamUuid", team_uuid);
          studentFormData.append("encryptedStudentId", student.encryptedStudentProfileId);
          studentFormData.append("githubUrl", student.githubUrl);
          studentFormData.append("info", student.info);
          studentFormData.append("studentBlog", student.studentBlog);
          studentFormData.append("studentEmail", student.studentEmail);

          if (student.profileImage === "") {
            studentFormData.append("profileImage", "");
            studentFormData.append("profileImageOperation", "DELETE");
          } else if (student.profileImage.startsWith("blob:")) {
            const originalUrl = originalStudents.find(
              (s) => s.encryptedStudentProfileId === student.encryptedStudentProfileId
            )?.profileImage;
            const fallbackFilename = extractFilenameFromUrl(originalUrl || "", "profile.jpg");
            const file = await urlToFile(student.profileImage, fallbackFilename);
            const { s3Url, cloudFrontUrl } = await getPresignedUrlStudent({
              encryptedStudentId: student.encryptedStudentProfileId,
              fileType: "STUDENT_PROFILE",
              contentType: file.type,
              extension: mimeToExt(file.type),
            });

            await uploadWithProgress(s3Url, file);
            // await axios.put(s3Url, file, {
            //   headers: { "Content-Type": file.type },
            //   onUploadProgress: (event) => {
            //     // ✅ 상태 업데이트
            //     const percent = Math.round((event.loaded / event.total!) * 100);
            //     setProgress(percent);
            //   },
            // });

            studentFormData.append("profileImage", cloudFrontUrl);
            studentFormData.append("profileImageOperation", "UPLOAD");
          }

          // studentFormData.forEach((v, k) => // console.log(`[studentFormData] ${k}:`, v));

          await putTeamStudent(studentFormData);
        })
      );

      // 8. 완료 처리
      if (teamPostResponse) {
        setIsDirty(false);
        notifySuccess("저장되었습니다.");
        navigate(-1);
      }
    } catch (error: unknown) {
      // console.error("[오류 발생]", error);
      notifyError("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      loadingStop();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Container>
      <TeamIntro>
        {/* 제목 및 카테고리 */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
          <EditableTitle
            type="text"
            name="title"
            value={editData.title}
            onChange={handleInputChange}
            placeholder="PROJECT TITLE"
          />

          <CategorySelect name="category" value={editData.category} onChange={handleSelectChange}>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </CategorySelect>
        </div>

        {/* 팀 프로필 이미지 */}
        <div style={{ gridRow: "span 2" }}>
          <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
            {editData.teamProfileImage ? (
              <>
                <TeamProfile
                  src={
                    typeof editData.teamProfileImage === "string"
                      ? editData.teamProfileImage
                      : URL.createObjectURL(editData.teamProfileImage)
                  }
                  alt="Team Profile"
                />
                <Overlay className="overlay">Team Profile</Overlay>
              </>
            ) : (
              <SquareMediaButton>+</SquareMediaButton>
            )}
          </ImageWrapper>
          <FileInput
            id="teamProfileInput"
            type="file"
            name="teamProfileImage"
            accept=".jpg,.png"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <FileFormatNotice>* jpg, png 형식만 업로드 가능합니다.</FileFormatNotice>
          {editData.teamProfileImage && (
            <DeleteSqButton
              onClick={() => {
                setEditData((prev) => ({ ...prev, teamProfileImage: "" }));
                setIsDirty(true);
              }}
            >
              팀 프로필 삭제
            </DeleteSqButton>
          )}
        </div>

        {/* 팀 내용 */}
        <EditableTextArea
          name="content"
          value={editData.content}
          onChange={handleInputChange}
          placeholder="Enter Project Description"
          rows={6}
          maxLength={500}
        />
        <CharCount>{(editData.content || "").length} / 500</CharCount>
      </TeamIntro>
      <SectionTitle>Members</SectionTitle>
      <StudentList>
        {editedStudents
          .slice()
          .sort((a, b) => {
            if (a.role === "LEADER" && b.role !== "LEADER") return -1;
            if (a.role !== "LEADER" && b.role === "LEADER") return 1;
            return a.name.localeCompare(b.name);
          })
          .map((student, index) => (
            <StudentItem key={index} onClick={() => handleStudentClick(student)}>
              <StudentInfo src={student.profileImage ? student.profileImage : userEmpty} />
              <StudentName>{student.name}</StudentName>
            </StudentItem>
          ))}
      </StudentList>
      <Modal>
        {selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}
      </Modal>
      {/* 데모 영상 */}
      <div>
        <SectionTitle>Project Video</SectionTitle>
        <FileFormatNotice>* mkv, mp4, avi 형식만 업로드 가능합니다.(500MB 이하)</FileFormatNotice>
      </div>
      <DemoVideoEditor
        base={editData.demoVideo as string}
        handleFileChange={handleFileChange}
        onDelete={() => {
          setEditData((prev) => ({ ...prev, demoVideo: null }));
          setIsDirty(true);
        }}
      />
      {/* 포스터 */}
      <div>
        <SectionTitle>Poster</SectionTitle>
        <FileFormatNotice>* jpg, png 형식만 업로드 가능합니다.</FileFormatNotice>
      </div>
      <PosterIntro>
        <ImageWrapper onClick={() => posterInputRef.current?.click()}>
          {editData.posterImage ? (
            <>
              <PosterImg
                src={
                  typeof editData.posterImage === "string"
                    ? editData.posterImage
                    : URL.createObjectURL(editData.posterImage)
                }
                alt="Poster"
              />
              <Overlay className="overlay">Poster</Overlay>
            </>
          ) : (
            <PosterMediaButton>+</PosterMediaButton>
          )}
        </ImageWrapper>
        <FileInput
          ref={posterInputRef}
          type="file"
          name="posterImage"
          accept=".jpg,.png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </PosterIntro>
      {editData.posterImage && (
        <DeleteSqButton
          onClick={() => {
            setEditData((prev) => ({ ...prev, posterImage: "" }));
            setIsDirty(true);
          }}
        >
          포스터 삭제
        </DeleteSqButton>
      )}
      <SaveButton onClick={handleSave}>SAVE</SaveButton>
      {isLoading && (
        <>
          <Spinner progress={progress} />
        </>
      )}
      {/* {isLoading && <Spinner />} */}{" "}
    </Container>
  );
};

export default TeamEditPage;
