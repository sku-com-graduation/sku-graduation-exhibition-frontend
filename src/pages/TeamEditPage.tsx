import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "@api/teamPost";
import DemoVideoEditor from "@components/DemoVideoEditor";
import { EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
import { extractFilenameFromUrl, urlToFile } from "@utils/File";
import { useModal, usePrompt, useToast } from "@hooks";
import Profile from "@components/Profile";

import empty from "@assets/image/main_image.png";
import userEmpty from "@assets/image/user.png";
import back_image from "@assets/image/back_image.png";
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
} from "./TeamEditPage.styled";
import { getPresignedUrlStudent, getPresignedUrlTeamPost } from "@api/presignedUrl";
import axios from "axios";

/* ────────────────
   메인 컴포넌트
   ──────────────── */

interface IEditForm {
  title: string;
  content: string;
  category: string;
  teamProfileImage: File | string;
  demoVideo: File | string;
  posterImage: File | string;
}

const TeamEditPage = () => {
  const { team_uuid, year } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
  const { isLoading, setIsLoading, loadingStart, loadingStop } = useSpinner();

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
    console.log("????????????? " + JSON.stringify(teampostEdit, null, 4));
  }, [teampostEdit]);
  useEffect(() => {
    console.log("!!!!!!!!!: " + JSON.stringify(editData, null, 4));
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
    console.log("파일 파꾸기");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({ ...prev, [e.target.name]: file }));
      setIsDirty(true);
    }
  };

  // 학생 클릭 시 해당 학생 및 인덱스를 함께 선택하여 모달 오픈
  const handleStudentClick = (student: ITeamPostEditStudent) => {
    setSelectedStudent(student);
    openModal();
  };

  // 수정된 학생 데이터를 상위 상태에 업데이트
  const updateStudent = (updatedStudent: ITeamPostEditStudent) => {
    setEditedStudents((prev) =>
      prev.map((stu) => (stu.encryptedStudentProfileId === updatedStudent.encryptedStudentProfileId ? updatedStudent : stu))
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
    if (!team_uuid) return;
    loadingStart();

    try {
      // 1. 수정된 파일만 File 객체로 분리
      const teamProfileFile = editData.teamProfileImage instanceof File ? editData.teamProfileImage : null;
      const demoFile = editData.demoVideo instanceof File ? editData.demoVideo : null;
      const posterFile = editData.posterImage instanceof File ? editData.posterImage : null;

      console.log("teamProfileFile =", teamProfileFile ? `${teamProfileFile.name} (${teamProfileFile.type})` : "null");
      console.log("demoFile =", demoFile ? `${demoFile.name} (${demoFile.type})` : "null");
      console.log("posterFile =", posterFile ? `${posterFile.name} (${posterFile.type})` : "null");

      // 2. presigned 요청용 정보 생성
      const mimeToExt = (mime: string): string => {
        const map: Record<string, string> = {
          "video/x-matroska": "mkv",
          "video/mp4": "mp4",
          "video/x-msvideo": "avi",
          "image/jpeg": "jpg",
          "image/png": "png",
        };
        return map[mime] || "unsupported";
      };

      const fileInfos = [];
      if (teamProfileFile)
        fileInfos.push({
          fileType: "TEAM_PROFILE" as const,
          contentType: teamProfileFile.type,
          extension: mimeToExt(teamProfileFile.type),
        });
      if (demoFile) fileInfos.push({ fileType: "DEMO" as const, contentType: demoFile.type, extension: mimeToExt(demoFile.type) });
      if (posterFile)
        fileInfos.push({
          fileType: "POSTER" as const,
          contentType: posterFile.type,
          extension: mimeToExt(posterFile.type),
        });

      // 3. presigned URL 요청
      const presignedUrls = fileInfos.length ? await getPresignedUrlTeamPost({ teamUuid: team_uuid, fileInfos }) : [];
      const uploadedMap = new Map(presignedUrls.map((u) => [u.fileType, u.cloudFrontUrl]));
      console.log("📦 presignedUrls =", JSON.stringify(presignedUrls, null, 4));
      console.log("📦 uploadedMap =", Object.fromEntries(uploadedMap));

      // 4. 실제 S3 업로드
      await Promise.all(
        presignedUrls.map(async (item) => {
          let file: File | null = null;
          if (item.fileType === "TEAM_PROFILE") file = teamProfileFile;
          if (item.fileType === "DEMO") file = demoFile;
          if (item.fileType === "POSTER") file = posterFile;

          if (file) {
            await axios.put(item.s3Url, file, {
              headers: { "Content-Type": file.type, "x-amz-meta-content-type": file.type },
            });
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
        // 새로 올린 이미지
        console.log("111111111111111111" + uploadedMap.get("TEAM_PROFILE"));
        formData.append("teamProfileImage", uploadedMap.get("TEAM_PROFILE")!);
      } else if (typeof editData.teamProfileImage === "string") {
        // 기존 이미지 유지
        console.log("222222222");

        formData.append("teamProfileImage", editData.teamProfileImage);
      } else {
        // 이미지 없음
        console.log("2333333333333333333333333333");

        formData.append("teamProfileImage", "");
      }

      formData.append("teamProfileImageOperation", "UPLOAD");

      // demoVideo
      formData.append("demoVideo", uploadedMap.get("DEMO") ?? (typeof editData.demoVideo === "string" ? editData.demoVideo : ""));
      formData.append("demoVideoOperation", "UPLOAD");

      // posterImage
      formData.append("posterImage", uploadedMap.get("POSTER") ?? (typeof editData.posterImage === "string" ? editData.posterImage : ""));
      formData.append("posterImageOperation", "UPLOAD");

      // 테스트용
      formData.append("teamProfileImagePath", `/teamPost/${team_uuid}/teamProfile`);
      formData.append("demoVideoPath", `/teamPost/${team_uuid}/demo`);
      formData.append("posterImagePath", `/teamPost/${team_uuid}/poster`);

      // formData.forEach((v, k) => console.log(`[formData] ${k}:`, v));

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

          if (student.profileImage.startsWith("blob:")) {
            const originalUrl = originalStudents.find((s) => s.encryptedStudentProfileId === student.encryptedStudentProfileId)?.profileImage;
            const fallbackFilename = extractFilenameFromUrl(originalUrl || "", "profile.jpg");
            const file = await urlToFile(student.profileImage, fallbackFilename);
            const { s3Url, cloudFrontUrl } = await getPresignedUrlStudent({
              encryptedStudentId: student.encryptedStudentProfileId,
              fileType: "STUDENT_PROFILE",
              contentType: file.type,
              extension: file.type,
            });

            await axios.put(s3Url, file, {
              headers: { "Content-Type": file.type, "x-amz-meta-content-type": file.type },
            });

            studentFormData.append("profileImage", cloudFrontUrl);
            studentFormData.append("profileImageOperation", "UPLOAD");
          }

          return putTeamStudent(studentFormData);
        })
      );

      // 8. 완료 처리
      // if (teamPostResponse) {
      //   setIsDirty(false);
      //   notifySuccess("저장되었습니다.");
      //   // navigate(-1);
      //   console.log(`/${year}/project/${team_uuid}`);
      //   navigate(`/${year}/project/${team_uuid}`);
      // }
      // 저장 성공 후 navigate 최적화
      if (teamPostResponse) {
        setIsDirty(false);
        notifySuccess("저장되었습니다.");

        if (!year || !team_uuid) {
          console.error("🚨 navigate 실패: year 또는 team_uuid가 undefined", { year, team_uuid });
          return;
        }

        const targetUrl = `/${year}/project/${team_uuid}?refresh=${Date.now()}`;
        console.log("✅ navigating to:", targetUrl);

        // React state 업데이트 이후 약간의 여유를 두고 navigate
        setTimeout(() => {
          navigate(targetUrl);
        }, 0);
      } else {
        throw new Error("팀 게시글 저장 실패");
      }
    } catch (error: unknown) {
      console.error("[오류 발생]", error);
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <EditableTitle type="text" name="title" value={editData.title} onChange={handleInputChange} placeholder="PROJECT TITLE" />
          <CategorySelect name="category" value={editData.category} onChange={handleSelectChange}>
            <option value="WEB">WEB</option>
            <option value="MOBILE">MOBILE</option>
            <option value="GAME">GAME</option>
          </CategorySelect>
        </div>

        {/* 팀 프로필 이미지 */}
        <div style={{ gridRow: "span 2" }}>
          <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
            <TeamProfile
              src={
                editData.teamProfileImage
                  ? typeof editData.teamProfileImage === "string"
                    ? editData.teamProfileImage
                    : URL.createObjectURL(editData.teamProfileImage)
                  : empty
              }
              alt="Team Profile"
            />
            <Overlay className="overlay">Team Profile</Overlay>
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
      <Modal>{selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}</Modal>
      <div>
        <SectionTitle>Project Video</SectionTitle>
        <FileFormatNotice>* mkv, mp4, avi 형식만 업로드 가능합니다.</FileFormatNotice>
      </div>
      <DemoVideoEditor base={editData.demoVideo as string} handleFileChange={handleFileChange} />
      <div>
        <SectionTitle>Poster</SectionTitle>
        <FileFormatNotice>* jpg, png 형식만 업로드 가능합니다.</FileFormatNotice>
      </div>
      <PosterIntro>
        <ImageWrapper onClick={() => posterInputRef.current?.click()}>
          <PosterImg
            src={
              editData.posterImage
                ? typeof editData.posterImage === "string"
                  ? editData.posterImage
                  : URL.createObjectURL(editData.posterImage)
                : back_image
            }
            alt="Poster"
          />
          <Overlay className="overlay">Poster</Overlay>
        </ImageWrapper>
        <FileInput ref={posterInputRef} type="file" name="posterImage" accept=".jpg,.png" onChange={handleFileChange} style={{ display: "none" }} />
      </PosterIntro>
      <SaveButton onClick={handleSave}>SAVE</SaveButton> {isLoading && <Spinner />}
    </Container>
  );
};

export default TeamEditPage;
