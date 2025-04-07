import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { postGetTeampostEdit, putTeampost, putTeampostSlideImage, putTeamStudent } from "../api/teamPost";
import empty from "../assets/image/main_image.png";
import SlideImageEditor from "@components/SlideImageEditor";
import DemoVideoEditor from "@components/DemoVideoEditor";
import { AddArea, EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
import base64ToFile from "@utils/base64ToFile";
import { useModal, useToast } from "@hooks";
import Profile from "@components/Profile";

import userEmpty from "../assets/image/main_image.png";
import { ITeamPostEdit, ITeamPostEditStudent } from "@interface";

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 3rem;
  place-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
`;

const TeamIntro = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 2rem;
  box-sizing: border-box;
  padding: 4rem;
  border-radius: 1rem;
  background-color: #f9f9f9;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  justify-items: center;
  text-align: left;
  margin-top: 5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 2rem;
  }
`;

const TeamProfile = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  transition: filter 0.3s ease-in-out;

  &:hover {
    filter: brightness(50%);
  }

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
    margin: 0 auto;
  }
`;

const CharCount = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
`;

const PosterIntro = styled.div`
  width: 100%;
  display: grid;
  place-items: center;
`;

const PosterImg = styled.img`
  width: 50%;
  height: auto;
  object-fit: cover;
  max-width: 100%;

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:hover {
    background-color: #005bb5;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;

  &:hover .overlay {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
`;

const StudentList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const StudentItem = styled.div`
  text-align: center;
`;

const StudentInfo = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 5rem;
  border: 0.1rem solid #d8d8d8;
  object-fit: cover;
  transition: filter 0.3s ease-in-out;

  &:hover {
    filter: brightness(50%);
  }

  @media (max-width: 768px) {
    width: 4.5rem;
    height: 4.5rem;
  }
`;

const StudentName = styled.div`
  margin-top: 0.5rem;
`;

const CategorySelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #fff;
  color: #333;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

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

  const [selectedStudent, setSelectedStudent] = useState<(ITeamPostEditStudent & { index: number }) | null>(null);
  const { openModal, Modal } = useModal();

  const [existingSlideImages, setExistingSlideImages] = useState<string[]>([]);
  const [newSlideImages, setNewSlideImages] = useState<File[]>([]);

  const posterInputRef = useRef<HTMLInputElement>(null);

  const { notifySuccess, notifyInfo, notifyError } = useToast();

  // 팀 정보 불러오기
  const getTeampostEdit = async (team_id: string) => {
    try {
      const res = await postGetTeampostEdit(team_id);
      console.log(res);
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

  // teampost 로드 시 팀 정보와 학생 데이터를 상태에 저장
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
      setExistingSlideImages(teampostEdit.slideImages || []);
      setEditedStudents(teampostEdit.students);
      setOriginalStudents(teampostEdit.students); // ⬅️ 추가
    }
  }, [teampostEdit]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: file,
      }));
    }
  };

  // 학생 클릭 시 해당 학생과 인덱스를 함께 선택하여 모달 오픈
  const handleStudentClick = (student: ITeamPostEditStudent, index: number) => {
    setSelectedStudent({ ...student, index });
    openModal();
  };

  // 수정된 학생 데이터를 상위 상태에 업데이트
  const updateStudent = (updatedStudent: ITeamPostEditStudent & { index: number }) => {
    setEditedStudents((prev) => prev.map((stu, idx) => (idx === updatedStudent.index ? updatedStudent : stu)));
    setSelectedStudent(null);
  };

  const isStudentModified = (original: ITeamPostEditStudent, edited: ITeamPostEditStudent) => {
    return (
      original.githubUrl !== edited.githubUrl ||
      original.info !== edited.info ||
      original.profileImage !== edited.profileImage ||
      original.studentBlog !== edited.studentBlog ||
      original.studentEmail !== edited.studentEmail
    );
  };

  const handleSave = async () => {
    if (!team_uuid) return;
    try {
      const teamProfileFile =
        editData.teamProfileImage instanceof File
          ? editData.teamProfileImage
          : base64ToFile(editData.teamProfileImage as string, "profile.jpg", "image/jpeg");
      const demoFile =
        editData.demoVideo instanceof File ? editData.demoVideo : base64ToFile(editData.demoVideo as string, "demoVideo.mp4", "video/mp4");
      const posterFile =
        editData.posterImage instanceof File ? editData.posterImage : base64ToFile(editData.posterImage as string, "poster.jpg", "image/jpeg");

      const formData = new FormData();
      formData.append("teamUuid", team_uuid);
      formData.append("title", editData.title);
      formData.append("content", editData.content);
      formData.append("category", editData.category);
      formData.append("teamProfileImage", teamProfileFile);
      formData.append("demoVideo", demoFile);
      formData.append("posterImage", posterFile);
      const teamPostResponse = await putTeampost(formData);

      let slideImageResponse = true;
      if (existingSlideImages.length > 0 || newSlideImages.length > 0) {
        const formDataSlide = new FormData();
        formDataSlide.append("teamUuid", team_uuid);
        existingSlideImages.forEach((img, idx) => {
          const file = base64ToFile(img, `existing_slide_${idx}.jpg`, "image/jpeg");
          formDataSlide.append("files", file);
        });
        newSlideImages.forEach((file) => {
          formDataSlide.append("files", file);
        });
        slideImageResponse = await putTeampostSlideImage(formDataSlide);
      }

      // ✅ 수정된 학생만 필터링
      const modifiedStudents = editedStudents.filter((edited, index) => {
        const original = originalStudents[index];
        return isStudentModified(original, edited);
      });

      await Promise.all(
        modifiedStudents.map((student) => {
          const studentFormData = new FormData();
          studentFormData.append("teamUuid", team_uuid);
          studentFormData.append("encryptedStudentId", student.encryptedStudentProfileId);
          studentFormData.append("githubUrl", student.githubUrl);
          studentFormData.append("info", student.info);
          const profileImage = base64ToFile(student.profileImage, `team.jpg`, "image/jpeg");
          studentFormData.append("profileImage", profileImage);
          studentFormData.append("studentBlog", student.studentBlog);
          studentFormData.append("studentEmail", student.studentEmail);
          return putTeamStudent(studentFormData);
        })
      );

      if (teamPostResponse && slideImageResponse) {
        navigate(-1);
      } else {
        throw new Error("Save operation failed");
      }
    } catch (error) {
      console.error(error);
      notifyError("저장에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Container>
      <TeamIntro>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <EditableTitle type="text" name="title" value={editData.title} onChange={handleInputChange} placeholder="PROJECT TITLE" />
          <CategorySelect name="category" value={editData.category} onChange={handleSelectChange}>
            <option value="WEB">WEB</option>
            <option value="MOBILE">MOBILE</option>
            <option value="GAME">GAME</option>
          </CategorySelect>
        </div>

        <div style={{ gridRow: "span 2" }}>
          <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
            <TeamProfile
              src={
                editData.teamProfileImage
                  ? typeof editData.teamProfileImage === "string"
                    ? `data:image/jpeg;base64,${editData.teamProfileImage}`
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
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

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

      <SectionTitle>Slide Images</SectionTitle>
      <SlideImageEditor
        existingImages={existingSlideImages}
        newImages={newSlideImages}
        setExistingImages={setExistingSlideImages}
        setNewImages={setNewSlideImages}
      />

      <SectionTitle>Members</SectionTitle>
      <StudentList>
        {editedStudents.map((student, index) => (
          <StudentItem key={index} onClick={() => handleStudentClick(student, index)}>
            <StudentInfo src={student.profileImage ? `data:image/jpeg;base64,${student.profileImage}` : userEmpty} />
            <StudentName>{student.name}</StudentName>
          </StudentItem>
        ))}
      </StudentList>
      <Modal>{selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} onSave={updateStudent} />}</Modal>

      <SectionTitle>Project Video</SectionTitle>
      <DemoVideoEditor base={editData.demoVideo as string} handleFileChange={handleFileChange} />

      <SectionTitle>Poster</SectionTitle>
      <PosterIntro>
        <PosterImg
          src={
            editData.posterImage
              ? typeof editData.posterImage === "string"
                ? `data:image/jpeg;base64,${editData.posterImage}`
                : URL.createObjectURL(editData.posterImage)
              : empty
          }
          alt="Poster"
        />
        <AddArea onClick={() => posterInputRef.current?.click()}>Add Poster</AddArea>
        <FileInput ref={posterInputRef} type="file" name="posterImage" accept="image/*" onChange={handleFileChange} />
      </PosterIntro>

      <SaveButton onClick={handleSave}>SAVE</SaveButton>
    </Container>
  );
};

export default TeamEditPage;
