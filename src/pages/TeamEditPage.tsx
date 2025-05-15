import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "@api/teamPost";
import DemoVideoEditor from "@components/DemoVideoEditor";
import { EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
import { urlToFile } from "@utils/File";
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
  const { team_uuid } = useParams();
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
      if (demoFile)
        fileInfos.push({ fileType: "DEMO" as const, contentType: demoFile.type, extension: mimeToExt(demoFile.type) });
      if (posterFile)
        fileInfos.push({
          fileType: "POSTER" as const,
          contentType: posterFile.type,
          extension: mimeToExt(posterFile.type),
        });
      console.log("fileInfos = " + JSON.stringify(fileInfos, null, 4));

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
            console.log("file.type = " + file.type);
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
      formData.append(
        "demoVideo",
        uploadedMap.get("DEMO") ?? (typeof editData.demoVideo === "string" ? editData.demoVideo : "")
      );
      formData.append("demoVideoOperation", "UPLOAD");

      // posterImage
      formData.append(
        "posterImage",
        uploadedMap.get("POSTER") ?? (typeof editData.posterImage === "string" ? editData.posterImage : "")
      );
      formData.append("posterImageOperation", "UPLOAD");

      // 테스트용
      formData.append("teamProfileImagePath", `/teamPost/${team_uuid}/teamProfile`);
      formData.append("demoVideoPath", `/teamPost/${team_uuid}/demo`);
      formData.append("posterImagePath", `/teamPost/${team_uuid}/poster`);

      formData.forEach((v, k) => console.log(`[formData] ${k}:`, v));

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
            const file = await urlToFile(student.profileImage, "profile.jpg");
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
      if (teamPostResponse) {
        setIsDirty(false);
        notifySuccess("저장되었습니다.");
        navigate(-1);
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
          <EditableTitle
            type="text"
            name="title"
            value={editData.title}
            onChange={handleInputChange}
            placeholder="PROJECT TITLE"
          />
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
      <Modal>
        {selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}
      </Modal>
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
        <FileInput
          ref={posterInputRef}
          type="file"
          name="posterImage"
          accept=".jpg,.png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </PosterIntro>
      <SaveButton onClick={handleSave}>SAVE</SaveButton> {isLoading && <Spinner />}
    </Container>
  );
};

export default TeamEditPage;

// import { useEffect, useState, useRef, ChangeEvent } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import styled from "styled-components";

// import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "@api/teamPost";
// import SlideImageEditor from "@components/SlideImageEditor";
// import DemoVideoEditor from "@components/DemoVideoEditor";
// import { EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
// import { urlToFile } from "@utils/File";
// import { useModal, usePrompt, useToast } from "@hooks";
// import Profile from "@components/Profile";

// import empty from "@assets/image/main_image.png";
// import userEmpty from "@assets/image/user.png";
// import back_image from "@assets/image/back_image.png";
// import { ITeamPostEdit, ITeamPostEditStudent } from "@interface";
// import { useSpinner } from "src/hooks/useSpinner";
// import Spinner from "@components/Spinner";

// /* ────────────────
//    Styled Components
//    ──────────────── */

// const Container = styled.div`
//   width: 100%;
//   display: grid;
//   grid-template-rows: repeat(5, auto);
//   gap: 3rem;
//   place-items: center;
// `;

// const SectionTitle = styled.h2`
//   font-size: 2rem;
//   font-weight: 600;
//   color: #333;
//   margin-bottom: 1rem;
//   text-align: center;
//   text-transform: uppercase;
//   letter-spacing: 0.2rem;
// `;

// const TeamIntro = styled.div`
//   width: 100%;
//   display: grid;
//   grid-template-columns: 1.5fr 1fr;
//   grid-template-rows: auto 1fr;
//   gap: 2rem;
//   box-sizing: border-box;
//   padding: 4rem;
//   border-radius: 1rem;
//   background-color: #f9f9f9;
//   box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
//   justify-items: center;
//   text-align: left;
//   margin-top: 5rem;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     grid-template-rows: auto auto;
//     padding: 2rem;
//   }
// `;

// const TeamProfile = styled.img`
//   width: 100%;
//   aspect-ratio: 1 / 1;
//   object-fit: cover;
//   border-radius: 1rem;
//   box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
//   margin: 0 auto;
//   transition: filter 0.3s ease-in-out;

//   &:hover {
//     filter: brightness(50%);
//   }

//   @media (max-width: 768px) {
//     width: 15rem;
//     height: 15rem;
//     margin: 0 auto;
//   }
// `;

// const CharCount = styled.div`
//   font-size: 0.9rem;
//   color: #666;
//   text-align: right;
//   margin-top: 0.25rem;
// `;

// const PosterIntro = styled.div`
//   width: 100%;
//   max-width: 80rem;
//   display: grid;
//   place-items: center;
// `;

// const PosterImg = styled.img`
//   width: 100%;
//   height: auto;
//   object-fit: cover;
//   max-width: 100%;
// `;

// const SaveButton = styled.button`
//   position: fixed;
//   bottom: 2rem;
//   right: 2rem;
//   z-index: 1000;

//   padding: 0.75rem 2rem;
//   background-color: #0070f3;
//   color: #fff;
//   border: none;
//   border-radius: 0.5rem;
//   font-size: 1rem;
//   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
//   cursor: pointer;

//   &:hover {
//     background-color: #005bb5;
//   }

//   @media (max-width: 768px) {
//     bottom: 1rem;
//     right: 1rem;
//     padding: 0.6rem 1.5rem;
//     font-size: 0.9rem;
//   }
// `;

// const FileFormatNotice = styled.div`
//   margin-top: 0.5rem;
//   font-size: 0.9rem;
//   color: #666;
//   text-align: center;
// `;

// const ImageWrapper = styled.div`
//   position: relative;
//   width: 100%;

//   &:hover .overlay {
//     opacity: 1;
//   }
// `;

// const Overlay = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: rgba(0, 0, 0, 0.8);
//   border-radius: 1rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #fff;
//   font-size: 2rem;
//   font-weight: bold;
//   opacity: 0;
//   transition: opacity 0.3s ease-in-out;
// `;

// const StudentList = styled.div`
//   display: flex;
//   justify-content: center;
//   flex-wrap: wrap;
//   gap: 1rem;
// `;

// const StudentItem = styled.div`
//   text-align: center;
// `;

// const StudentInfo = styled.img`
//   width: 10rem;
//   height: 10rem;
//   border-radius: 5rem;
//   border: 0.1rem solid #d8d8d8;
//   object-fit: cover;
//   transition: filter 0.3s ease-in-out;

//   &:hover {
//     filter: brightness(50%);
//   }

//   @media (max-width: 768px) {
//     width: 4.5rem;
//     height: 4.5rem;
//   }
// `;

// const StudentName = styled.div`
//   margin-top: 0.5rem;
// `;

// const CategorySelect = styled.select`
//   padding: 0.5rem 1rem;
//   border: 1px solid #ccc;
//   border-radius: 0.5rem;
//   font-size: 1rem;
//   background-color: #fff;
//   color: #333;

//   &:focus {
//     outline: none;
//     border-color: #0070f3;
//   }
// `;

// /* ────────────────
//    메인 컴포넌트
//    ──────────────── */

// interface IEditForm {
//   title: string;
//   content: string;
//   category: string;
//   teamProfileImage: File | string;
//   demoVideo: File | string;
//   posterImage: File | string;
// }

// const TeamEditPage = () => {
//   const { team_uuid } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [teampostEdit, setTeampostEdit] = useState<ITeamPostEdit | null>(null);
//   const [editData, setEditData] = useState<IEditForm>({
//     title: "",
//     content: "",
//     category: "",
//     teamProfileImage: "",
//     demoVideo: "",
//     posterImage: "",
//   });

//   const [editedStudents, setEditedStudents] = useState<ITeamPostEditStudent[]>([]);
//   const [originalStudents, setOriginalStudents] = useState<ITeamPostEditStudent[]>([]);
//   const [selectedStudent, setSelectedStudent] = useState<ITeamPostEditStudent | null>(null);
//   const { openModal, closeModal, Modal } = useModal();

//   const [existingSlideImages, setExistingSlideImages] = useState<string[]>([]);
//   const [newSlideImages, setNewSlideImages] = useState<File[]>([]);
//   const posterInputRef = useRef<HTMLInputElement>(null);

//   const { notifySuccess, notifyInfo, notifyError } = useToast();
//   const { isLoading, setIsLoading, loadingStart, loadingStop } = useSpinner();

//   const [isDirty, setIsDirty] = useState<boolean>(false);

//   usePrompt(isDirty);

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (isDirty) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [isDirty]);

//   // 팀 정보 불러오기
//   const getTeampostEdit = async (team_id: string) => {
//     try {
//       const res = await postGetTeampostEdit(team_id);
//       setTeampostEdit(res);
//     } catch (error) {
//       notifyError("팀 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
//     }
//   };

//   useEffect(() => {
//     if (team_uuid) {
//       getTeampostEdit(team_uuid);
//     }
//   }, [team_uuid]);

//   useEffect(() => {
//     console.log("editData = " + JSON.stringify(editData, null, 4));
//   }, [editData]);

//   useEffect(() => {
//     if (teampostEdit) {
//       setEditData({
//         title: teampostEdit.title,
//         content: teampostEdit.content,
//         category: teampostEdit.category,
//         teamProfileImage: teampostEdit.teamProfileImage,
//         demoVideo: teampostEdit.demoVideo,
//         posterImage: teampostEdit.posterImage,
//       });
//       setExistingSlideImages(teampostEdit.slideImages || []);
//       setEditedStudents(teampostEdit.students);
//       setOriginalStudents(teampostEdit.students);
//     }
//   }, [teampostEdit]);

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     setIsDirty(true);
//   };

//   const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     setIsDirty(true);
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setEditData((prev) => ({ ...prev, [e.target.name]: file }));
//       setIsDirty(true);
//     }
//   };

//   // 학생 클릭 시 해당 학생 및 인덱스를 함께 선택하여 모달 오픈
//   const handleStudentClick = (student: ITeamPostEditStudent) => {
//     setSelectedStudent(student);
//     openModal();
//   };

//   // 수정된 학생 데이터를 상위 상태에 업데이트
//   const updateStudent = (updatedStudent: ITeamPostEditStudent) => {
//     setEditedStudents((prev) =>
//       prev.map((stu) =>
//         stu.encryptedStudentProfileId === updatedStudent.encryptedStudentProfileId ? updatedStudent : stu
//       )
//     );
//     setSelectedStudent(null);
//     closeModal();
//     setIsDirty(true);
//   };

//   const isStudentModified = (original: ITeamPostEditStudent, edited: ITeamPostEditStudent): boolean =>
//     original.githubUrl !== edited.githubUrl ||
//     original.info !== edited.info ||
//     original.profileImage !== edited.profileImage ||
//     original.studentBlog !== edited.studentBlog ||
//     original.studentEmail !== edited.studentEmail;

//   // 저장 버튼 클릭 시 처리 (파일/URL 처리 포함)
//   const handleSave = async () => {
//     if (!team_uuid) return;
//     loadingStart();
//     try {
//       // teamProfileImage 처리
//       const teamProfileFile =
//         editData.teamProfileImage && editData.teamProfileImage !== ""
//           ? editData.teamProfileImage instanceof File
//             ? editData.teamProfileImage
//             : await urlToFile(editData.teamProfileImage as string, "profile.jpg")
//           : null;

//       // demoVideo 처리
//       const demoFile =
//         editData.demoVideo && editData.demoVideo !== ""
//           ? editData.demoVideo instanceof File
//             ? editData.demoVideo
//             : await urlToFile(editData.demoVideo as string, "demoVideo.mp4")
//           : null;

//       // posterImage 처리
//       const posterFile =
//         editData.posterImage && editData.posterImage !== ""
//           ? editData.posterImage instanceof File
//             ? editData.posterImage
//             : await urlToFile(editData.posterImage as string, "poster.jpg")
//           : null;

//       const formData = new FormData();
//       formData.append("teamUuid", team_uuid);
//       formData.append("title", editData.title || "");
//       formData.append("content", editData.content || "");
//       formData.append("category", editData.category || "");

//       if (teamProfileFile) {
//         formData.append("teamProfileImage", teamProfileFile);
//       }
//       if (demoFile) {
//         formData.append("demoVideo", demoFile);
//       }
//       if (posterFile) {
//         formData.append("posterImage", posterFile);
//       }

//       const teamPostResponse = await putTeampost(formData);

//       let slideImageResponse = true;
//       if (existingSlideImages.length > 0 || newSlideImages.length > 0) {
//         const formDataSlide = new FormData();
//         formDataSlide.append("teamUuid", team_uuid);

//         for (let idx = 0; idx < existingSlideImages.length; idx++) {
//           const img = existingSlideImages[idx];
//           const file = await urlToFile(img, `existing_slide_${idx}.jpg`);
//           formDataSlide.append("files", file);
//         }

//         newSlideImages.forEach((file) => {
//           formDataSlide.append("files", file);
//         });

//         slideImageResponse = await putTeampostSlideImage(formDataSlide);
//       }

//       // 수정된 학생 데이터만 필터링 후 업데이트
//       const modifiedStudents = editedStudents.filter((edited, index) => {
//         const original = originalStudents[index];
//         return isStudentModified(original, edited);
//       });

//       await Promise.all(
//         modifiedStudents.map(async (student) => {
//           const studentFormData = new FormData();
//           studentFormData.append("teamUuid", team_uuid);
//           studentFormData.append("encryptedStudentId", student.encryptedStudentProfileId);
//           studentFormData.append("githubUrl", student.githubUrl);
//           studentFormData.append("info", student.info);
//           studentFormData.append("studentBlog", student.studentBlog);
//           studentFormData.append("studentEmail", student.studentEmail);

//           // profileImage가 blob URL인 경우 파일로 변환
//           if (student.profileImage.startsWith("blob:")) {
//             const file = await urlToFile(student.profileImage, "profile.jpg");
//             studentFormData.append("profileImage", file);
//           }

//           return putTeamStudent(studentFormData);
//         })
//       );

//       if (teamPostResponse && slideImageResponse) {
//         setIsDirty(false);
//         notifySuccess("저장되었습니다.");
//         navigate(-1);
//       } else {
//         throw new Error("저장 실패");
//       }
//     } catch (error) {
//       notifyError("저장에 실패했습니다. 다시 시도해 주세요.");
//     } finally {
//       loadingStop(); // ✅ 커스텀 훅의 종료 함수 사용
//     }
//   };

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   return (
//     <Container>
//       <TeamIntro>
//         {/* 제목 및 카테고리 */}
//         <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
//           <EditableTitle
//             type="text"
//             name="title"
//             value={editData.title}
//             onChange={handleInputChange}
//             placeholder="PROJECT TITLE"
//           />
//           <CategorySelect name="category" value={editData.category} onChange={handleSelectChange}>
//             <option value="WEB">WEB</option>
//             <option value="MOBILE">MOBILE</option>
//             <option value="GAME">GAME</option>
//           </CategorySelect>
//         </div>

//         {/* 팀 프로필 이미지 */}
//         <div style={{ gridRow: "span 2" }}>
//           <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
//             <TeamProfile
//               src={
//                 editData.teamProfileImage
//                   ? typeof editData.teamProfileImage === "string"
//                     ? editData.teamProfileImage
//                     : URL.createObjectURL(editData.teamProfileImage)
//                   : empty
//               }
//               alt="Team Profile"
//             />
//             <Overlay className="overlay">Team Profile</Overlay>
//           </ImageWrapper>
//           <FileInput
//             id="teamProfileInput"
//             type="file"
//             name="teamProfileImage"
//             accept=".jpg,.png"
//             onChange={handleFileChange}
//             style={{ display: "none" }}
//           />
//           <FileFormatNotice>* jpg, png 형식만 업로드 가능합니다.</FileFormatNotice>
//         </div>

//         {/* 팀 내용 */}
//         <EditableTextArea
//           name="content"
//           value={editData.content}
//           onChange={handleInputChange}
//           placeholder="Enter Project Description"
//           rows={6}
//           maxLength={500}
//         />
//         <CharCount>{(editData.content || "").length} / 500</CharCount>
//       </TeamIntro>
//       {/* <SectionTitle>Slide Images</SectionTitle> */}
//       {/* <SlideImageEditor
//         existingImages={existingSlideImages}
//         newImages={newSlideImages}
//         setExistingImages={setExistingSlideImages}
//         setNewImages={setNewSlideImages}
//       /> */}
//       <SectionTitle>Members</SectionTitle>
//       <StudentList>
//         {editedStudents
//           .slice()
//           .sort((a, b) => {
//             if (a.role === "LEADER" && b.role !== "LEADER") return -1;
//             if (a.role !== "LEADER" && b.role === "LEADER") return 1;
//             return a.name.localeCompare(b.name);
//           })
//           .map((student, index) => (
//             <StudentItem key={index} onClick={() => handleStudentClick(student)}>
//               <StudentInfo src={student.profileImage ? student.profileImage : userEmpty} />
//               <StudentName>{student.name}</StudentName>
//             </StudentItem>
//           ))}
//       </StudentList>
//       <Modal>
//         {selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}
//       </Modal>
//       <div>
//         <SectionTitle>Project Video</SectionTitle>
//         <FileFormatNotice>* mkv, mp4, avi 형식만 업로드 가능합니다.</FileFormatNotice>
//       </div>
//       <DemoVideoEditor base={editData.demoVideo as string} handleFileChange={handleFileChange} />
//       <div>
//         <SectionTitle>Poster</SectionTitle>
//         <FileFormatNotice>* jpg, png 형식만 업로드 가능합니다.</FileFormatNotice>
//       </div>
//       <PosterIntro>
//         <ImageWrapper onClick={() => posterInputRef.current?.click()}>
//           <PosterImg
//             src={
//               editData.posterImage
//                 ? typeof editData.posterImage === "string"
//                   ? editData.posterImage
//                   : URL.createObjectURL(editData.posterImage)
//                 : back_image
//             }
//             alt="Poster"
//           />
//           <Overlay className="overlay">Poster</Overlay>
//         </ImageWrapper>
//         <FileInput
//           ref={posterInputRef}
//           type="file"
//           name="posterImage"
//           accept=".jpg,.png"
//           onChange={handleFileChange}
//           style={{ display: "none" }}
//         />
//       </PosterIntro>
//       <SaveButton onClick={handleSave}>SAVE</SaveButton> {isLoading && <Spinner />}
//     </Container>
//   );
// };

// export default TeamEditPage;

// // import { useEffect, useState, useRef, ChangeEvent } from "react";
// // import { useLocation, useNavigate, useParams } from "react-router-dom";
// // import styled from "styled-components";

// // import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "@api/teamPost";
// // import SlideImageEditor from "@components/SlideImageEditor";
// // import DemoVideoEditor from "@components/DemoVideoEditor";
// // import { EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
// // import { urlToFile } from "@utils/File";
// // import { useModal, useToast } from "@hooks";
// // import Profile from "@components/Profile";

// // import empty from "@assets/image/main_image.png";
// // import userEmpty from "@assets/image/user.png";
// // import back_image from "@assets/image/back_image.png";
// // import { ITeamPostEdit, ITeamPostEditStudent } from "@interface";

// // /* ────────────────
// //    Styled Components
// //    ──────────────── */

// // const Container = styled.div`
// //   width: 100%;
// //   display: grid;
// //   grid-template-rows: repeat(5, auto);
// //   gap: 3rem;
// //   place-items: center;
// // `;

// // const SectionTitle = styled.h2`
// //   font-size: 2rem;
// //   font-weight: 600;
// //   color: #333;
// //   margin-bottom: 1rem;
// //   text-align: center;
// //   text-transform: uppercase;
// //   letter-spacing: 0.2rem;
// // `;

// // const TeamIntro = styled.div`
// //   width: 100%;
// //   display: grid;
// //   grid-template-columns: 1.5fr 1fr;
// //   grid-template-rows: auto 1fr;
// //   gap: 2rem;
// //   box-sizing: border-box;
// //   padding: 4rem;
// //   border-radius: 1rem;
// //   background-color: #f9f9f9;
// //   box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
// //   justify-items: center;
// //   text-align: left;
// //   margin-top: 5rem;

// //   @media (max-width: 768px) {
// //     grid-template-columns: 1fr;
// //     grid-template-rows: auto auto;
// //     padding: 2rem;
// //   }
// // `;

// // const TeamProfile = styled.img`
// //   width: 100%;
// //   aspect-ratio: 1 / 1;
// //   object-fit: cover;
// //   border-radius: 1rem;
// //   box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
// //   margin: 0 auto;
// //   transition: filter 0.3s ease-in-out;

// //   &:hover {
// //     filter: brightness(50%);
// //   }

// //   @media (max-width: 768px) {
// //     width: 15rem;
// //     height: 15rem;
// //     margin: 0 auto;
// //   }
// // `;

// // const CharCount = styled.div`
// //   font-size: 0.9rem;
// //   color: #666;
// //   text-align: right;
// //   margin-top: 0.25rem;
// // `;

// // const PosterIntro = styled.div`
// //   width: 100%;
// //   max-width: 80rem;
// //   display: grid;
// //   place-items: center;
// // `;

// // const PosterImg = styled.img`
// //   width: 100%;
// //   height: auto;
// //   object-fit: cover;
// //   max-width: 100%;
// // `;

// // const SaveButton = styled.button`
// //   position: fixed;
// //   bottom: 2rem;
// //   right: 2rem;
// //   z-index: 1000;

// //   padding: 0.75rem 2rem;
// //   background-color: #0070f3;
// //   color: #fff;
// //   border: none;
// //   border-radius: 0.5rem;
// //   font-size: 1rem;
// //   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
// //   cursor: pointer;

// //   &:hover {
// //     background-color: #005bb5;
// //   }

// //   @media (max-width: 768px) {
// //     bottom: 1rem;
// //     right: 1rem;
// //     padding: 0.6rem 1.5rem;
// //     font-size: 0.9rem;
// //   }
// // `;

// // const ImageWrapper = styled.div`
// //   position: relative;
// //   width: 100%;

// //   &:hover .overlay {
// //     opacity: 1;
// //   }
// // `;

// // const Overlay = styled.div`
// //   position: absolute;
// //   top: 0;
// //   left: 0;
// //   width: 100%;
// //   height: 100%;
// //   background-color: rgba(0, 0, 0, 0.8);
// //   border-radius: 1rem;
// //   display: flex;
// //   align-items: center;
// //   justify-content: center;
// //   color: #fff;
// //   font-size: 2rem;
// //   font-weight: bold;
// //   opacity: 0;
// //   transition: opacity 0.3s ease-in-out;
// // `;

// // const StudentList = styled.div`
// //   display: flex;
// //   justify-content: center;
// //   flex-wrap: wrap;
// //   gap: 1rem;
// // `;

// // const StudentItem = styled.div`
// //   text-align: center;
// // `;

// // const StudentInfo = styled.img`
// //   width: 10rem;
// //   height: 10rem;
// //   border-radius: 5rem;
// //   border: 0.1rem solid #d8d8d8;
// //   object-fit: cover;
// //   transition: filter 0.3s ease-in-out;

// //   &:hover {
// //     filter: brightness(50%);
// //   }

// //   @media (max-width: 768px) {
// //     width: 4.5rem;
// //     height: 4.5rem;
// //   }
// // `;

// // const StudentName = styled.div`
// //   margin-top: 0.5rem;
// // `;

// // const CategorySelect = styled.select`
// //   padding: 0.5rem 1rem;
// //   border: 1px solid #ccc;
// //   border-radius: 0.5rem;
// //   font-size: 1rem;
// //   background-color: #fff;
// //   color: #333;

// //   &:focus {
// //     outline: none;
// //     border-color: #0070f3;
// //   }
// // `;

// // /* ────────────────
// //    메인 컴포넌트
// //    ──────────────── */

// // interface IEditForm {
// //   title: string;
// //   content: string;
// //   category: string;
// //   teamProfileImage: File | string;
// //   demoVideo: File | string;
// //   posterImage: File | string;
// // }

// // const TeamEditPage = () => {
// //   const { team_uuid } = useParams();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [teampostEdit, setTeampostEdit] = useState<ITeamPostEdit | null>(null);
// //   const [editData, setEditData] = useState<IEditForm>({
// //     title: "",
// //     content: "",
// //     category: "",
// //     teamProfileImage: "",
// //     demoVideo: "",
// //     posterImage: "",
// //   });

// //   const [editedStudents, setEditedStudents] = useState<ITeamPostEditStudent[]>([]);
// //   const [originalStudents, setOriginalStudents] = useState<ITeamPostEditStudent[]>([]);

// //   const [selectedStudent, setSelectedStudent] = useState<(ITeamPostEditStudent & { index: number }) | null>(null);
// //   const { openModal, closeModal, Modal } = useModal();

// //   const [existingSlideImages, setExistingSlideImages] = useState<string[]>([]);
// //   const [newSlideImages, setNewSlideImages] = useState<File[]>([]);

// //   const posterInputRef = useRef<HTMLInputElement>(null);

// //   const { notifySuccess, notifyInfo, notifyError } = useToast();

// //   // 팀 정보 불러오기
// //   const getTeampostEdit = async (team_id: string) => {
// //     try {
// //       const res = await postGetTeampostEdit(team_id);
// //       setTeampostEdit(res);
// //     } catch (error) {
// //       notifyError("팀 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
// //     }
// //   };

// //   useEffect(() => {
// //     if (team_uuid) {
// //       getTeampostEdit(team_uuid);
// //     }
// //   }, [team_uuid]);

// //   // teampost 로드 시 팀 정보와 학생 데이터를 상태에 저장
// //   useEffect(() => {
// //     if (teampostEdit) {
// //       setEditData({
// //         title: teampostEdit.title,
// //         content: teampostEdit.content,
// //         category: teampostEdit.category,
// //         teamProfileImage: teampostEdit.teamProfileImage,
// //         demoVideo: teampostEdit.demoVideo,
// //         posterImage: teampostEdit.posterImage,
// //       });
// //       setExistingSlideImages(teampostEdit.slideImages || []);
// //       setEditedStudents(teampostEdit.students);
// //       setOriginalStudents(teampostEdit.students);
// //     }
// //   }, [teampostEdit]);

// //   const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// //     setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
// //   };

// //   const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
// //     setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
// //   };

// //   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
// //     if (e.target.files && e.target.files[0]) {
// //       const file = e.target.files[0];
// //       setEditData((prev) => ({
// //         ...prev,
// //         [e.target.name]: file,
// //       }));
// //     }
// //   };

// //   // 학생 클릭 시 해당 학생과 인덱스를 함께 선택하여 모달 오픈
// //   const handleStudentClick = (student: ITeamPostEditStudent, index: number) => {
// //     setSelectedStudent({ ...student, index });
// //     openModal();
// //   };

// //   // 수정된 학생 데이터를 상위 상태에 업데이트
// //   const updateStudent = (updatedStudent: ITeamPostEditStudent & { index: number }) => {
// //     setEditedStudents((prev) => prev.map((stu, idx) => (idx === updatedStudent.index ? updatedStudent : stu)));
// //     setSelectedStudent(null);
// //     closeModal();
// //   };

// //   const isStudentModified = (original: ITeamPostEditStudent, edited: ITeamPostEditStudent) => {
// //     return (
// //       original.githubUrl !== edited.githubUrl ||
// //       original.info !== edited.info ||
// //       original.profileImage !== edited.profileImage ||
// //       original.studentBlog !== edited.studentBlog ||
// //       original.studentEmail !== edited.studentEmail
// //     );
// //   };

// //   // 저장 버튼 클릭 시 처리 (파일/URL 처리 및 null 처리 포함)
// //   const handleSave = async () => {
// //     if (!team_uuid) return;
// //     try {
// //       // teamProfileImage
// //       const teamProfileFile =
// //         editData.teamProfileImage && editData.teamProfileImage !== ""
// //           ? editData.teamProfileImage instanceof File
// //             ? editData.teamProfileImage
// //             : await urlToFile(editData.teamProfileImage as string, "profile.jpg")
// //           : null;

// //       // demoVideo
// //       const demoFile =
// //         editData.demoVideo && editData.demoVideo !== ""
// //           ? editData.demoVideo instanceof File
// //             ? editData.demoVideo
// //             : await urlToFile(editData.demoVideo as string, "demoVideo.mp4")
// //           : null;

// //       // posterImage
// //       const posterFile =
// //         editData.posterImage && editData.posterImage !== ""
// //           ? editData.posterImage instanceof File
// //             ? editData.posterImage
// //             : await urlToFile(editData.posterImage as string, "poster.jpg")
// //           : null;

// //       const formData = new FormData();
// //       formData.append("teamUuid", team_uuid);
// //       formData.append("title", editData.title || "");
// //       formData.append("content", editData.content || "");
// //       formData.append("category", editData.category || "");

// //       if (teamProfileFile) {
// //         formData.append("teamProfileImage", teamProfileFile);
// //       }
// //       if (demoFile) {
// //         formData.append("demoVideo", demoFile);
// //       }
// //       if (posterFile) {
// //         formData.append("posterImage", posterFile);
// //       }

// //       const teamPostResponse = await putTeampost(formData);

// //       let slideImageResponse = true;
// //       if (existingSlideImages.length > 0 || newSlideImages.length > 0) {
// //         const formDataSlide = new FormData();
// //         formDataSlide.append("teamUuid", team_uuid);

// //         for (let idx = 0; idx < existingSlideImages.length; idx++) {
// //           const img = existingSlideImages[idx];
// //           const file = await urlToFile(img, `existing_slide_${idx}.jpg`);
// //           formDataSlide.append("files", file);
// //         }

// //         newSlideImages.forEach((file) => {
// //           formDataSlide.append("files", file);
// //         });

// //         slideImageResponse = await putTeampostSlideImage(formDataSlide);
// //       }

// //       // 수정된 학생만 필터링
// //       const modifiedStudents = editedStudents.filter((edited, index) => {
// //         const original = originalStudents[index];
// //         return isStudentModified(original, edited);
// //       });

// //       await Promise.all(
// //         modifiedStudents.map(async (student) => {
// //           const studentFormData = new FormData();
// //           studentFormData.append("teamUuid", team_uuid);
// //           studentFormData.append("encryptedStudentId", student.encryptedStudentProfileId);
// //           studentFormData.append("githubUrl", student.githubUrl);
// //           studentFormData.append("info", student.info);
// //           studentFormData.append("studentBlog", student.studentBlog);
// //           studentFormData.append("studentEmail", student.studentEmail);

// //           if (student.profileImage.startsWith("blob:")) {
// //             const file = await urlToFile(student.profileImage, "profile.jpg");
// //             studentFormData.append("profileImage", file);
// //           } else {
// //             const file = await urlToFile(student.profileImage, "profile.jpg");
// //             studentFormData.append("profileImage", file);
// //           }

// //           return putTeamStudent(studentFormData);
// //         })
// //       );

// //       if (teamPostResponse && slideImageResponse) {
// //         navigate(-1);
// //       } else {
// //         throw new Error("Save operation failed");
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       notifyError("저장에 실패했습니다. 다시 시도해 주세요.");
// //     }
// //   };

// //   useEffect(() => {
// //     window.scrollTo(0, 0);
// //   }, [location]);

// //   return (
// // <Container>
// //   <TeamIntro>
// //     {/* 제목 및 카테고리 */}
// //     <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
// //       <EditableTitle
// //         type="text"
// //         name="title"
// //         value={editData.title}
// //         onChange={handleInputChange}
// //         placeholder="PROJECT TITLE"
// //       />
// //       <CategorySelect name="category" value={editData.category} onChange={handleSelectChange}>
// //         <option value="WEB">WEB</option>
// //         <option value="MOBILE">MOBILE</option>
// //         <option value="GAME">GAME</option>
// //       </CategorySelect>
// //     </div>

// //     {/* 팀 프로필 이미지 */}
// //     <div style={{ gridRow: "span 2" }}>
// //       <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
// //         <TeamProfile
// //           src={
// //             editData.teamProfileImage
// //               ? typeof editData.teamProfileImage === "string"
// //                 ? editData.teamProfileImage
// //                 : URL.createObjectURL(editData.teamProfileImage)
// //               : empty
// //           }
// //           alt="Team Profile"
// //         />
// //         <Overlay className="overlay">Team Profile</Overlay>
// //       </ImageWrapper>
// //       <FileInput
// //         id="teamProfileInput"
// //         type="file"
// //         name="teamProfileImage"
// //         accept="image/*"
// //         onChange={handleFileChange}
// //         style={{ display: "none" }}
// //       />
// //     </div>

// //     {/* 팀 내용 */}
// //     <EditableTextArea
// //       name="content"
// //       value={editData.content}
// //       onChange={handleInputChange}
// //       placeholder="Enter Project Description"
// //       rows={6}
// //       maxLength={500}
// //     />
// //     <CharCount>{(editData.content || "").length} / 500</CharCount>
// //   </TeamIntro>

// //   <SectionTitle>Slide Images</SectionTitle>
// //   <SlideImageEditor
// //     existingImages={existingSlideImages}
// //     newImages={newSlideImages}
// //     setExistingImages={setExistingSlideImages}
// //     setNewImages={setNewSlideImages}
// //   />

// //   <SectionTitle>Members</SectionTitle>
// //   <StudentList>
// //     {editedStudents.map((student, index) => (
// //       <StudentItem key={index} onClick={() => handleStudentClick(student, index)}>
// //         <StudentInfo src={student.profileImage ? student.profileImage : userEmpty} />
// //         <StudentName>{student.name}</StudentName>
// //       </StudentItem>
// //     ))}
// //   </StudentList>
// //   <Modal>
// //     {selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}
// //   </Modal>

// //   <SectionTitle>Project Video</SectionTitle>
// //   <DemoVideoEditor base={editData.demoVideo as string} handleFileChange={handleFileChange} />

// //   <SectionTitle>Poster</SectionTitle>
// //   <PosterIntro>
// //     <ImageWrapper onClick={() => posterInputRef.current?.click()}>
// //       <PosterImg
// //         src={
// //           editData.posterImage
// //             ? typeof editData.posterImage === "string"
// //               ? editData.posterImage
// //               : URL.createObjectURL(editData.posterImage)
// //             : back_image
// //         }
// //         alt="Poster"
// //       />
// //       <Overlay className="overlay">Poster</Overlay>
// //     </ImageWrapper>
// //     <FileInput
// //       ref={posterInputRef}
// //       type="file"
// //       name="posterImage"
// //       accept="image/*"
// //       onChange={handleFileChange}
// //       style={{ display: "none" }}
// //     />
// //   </PosterIntro>

// //   <SaveButton onClick={handleSave}>SAVE</SaveButton>
// // </Container>
// //   );
// // };

// // export default TeamEditPage;
