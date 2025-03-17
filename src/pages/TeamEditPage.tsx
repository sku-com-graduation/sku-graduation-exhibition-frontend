import { useEffect, useState, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { postGetTeampost, putTeampost, putTeampostSlideImage } from "../api/teamPost";
import { ITeamPost } from "../interface";
import empty from "../assets/image/empty.png";
import SlideImageEditor from "@components/SlideImageEditor";
import DemoVideoEditor from "@components/DemoVideoEditor";

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
    cursor: pointer;
    filter: brightness(50%);
  }

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
    margin: 0 auto;
  }
`;

const VideoIntro = styled.div`
  width: 100%;
  max-width: 80rem;
  overflow: hidden;
  padding: 1rem;
  box-sizing: border-box;
`;

const TeamVideo = styled.video`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1rem;
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

const EditableInput = styled.input`
  font-size: 2.6rem;
  font-weight: 700;
  color: #333;
  border: none;
  border-bottom: 2px solid #ccc;
  outline: none;
  width: 80%;
  background: transparent;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2.2rem;
    text-align: center;
    width: 90%;
  }
`;

const EditableTextArea = styled.textarea`
  width: 100%;
  max-width: 800px;
  min-height: 150px;
  font-size: 1.1rem;
  color: #333;
  line-height: 1.8;
  letter-spacing: 0.05rem;
  padding: 0.75rem;
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  background-color: #f9f9f9;
  resize: vertical;
  transition: border 0.2s ease-in-out, background 0.2s ease-in-out;
  font-family: "Pretendard-Regular", "Arial", sans-serif;

  &:focus {
    border: 1px solid #888;
    background-color: #fff;
    outline: none;
  }

  &::placeholder {
    color: #aaa;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    text-align: center;
    font-size: 1rem;
  }
`;

const FileInput = styled.input`
  margin-top: 0.5rem;
`;

const SlideContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SlideImage = styled.img`
  width: 100px;
  height: auto;
  object-fit: cover;
`;

const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;

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
  opacity: 0; /* 기본적으로 숨김 */
  transition: opacity 0.3s ease-in-out;
`;

interface IEditData {
  encryptedTeamId: string;
  title: string;
  content: string;
  category: string;
  teamProfileImage: File | string;
  demo: File | string;
  posterImg: File | string;
}

const TeamEditPage = () => {
  const { team_uuid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [teampost, setTeampost] = useState<ITeamPost | null>(null);
  const [editData, setEditData] = useState<IEditData>({
    encryptedTeamId: "",
    title: "",
    content: "",
    category: "",
    teamProfileImage: "",
    demo: "",
    posterImg: "",
  });

  // 기존 슬라이드 이미지는 base64 문자열로, 새 슬라이드 이미지는 File 객체로 관리
  const [existingSlideImages, setExistingSlideImages] = useState<string[]>([]);
  const [newSlideImages, setNewSlideImages] = useState<File[]>([]);

  // base64 문자열을 File 객체로 변환하는 헬퍼 함수
  const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ia], filename, { type: mimeType });
  };

  // 데이터 가져오기
  const getTeampost = async (team_id: string) => {
    const res = await postGetTeampost(team_id);
    setTeampost(res);
  };

  useEffect(() => {
    if (team_uuid) {
      getTeampost(team_uuid);
    }
  }, [team_uuid]);

  // teampost가 로드되면 editData 초기화 및 기존 슬라이드 이미지 저장
  useEffect(() => {
    if (teampost) {
      setEditData({
        encryptedTeamId: "test",
        title: teampost.teamInfo.projectName,
        content: teampost.teamInfo.explanation,
        category: teampost.teamInfo.category,
        teamProfileImage: teampost.teamInfo.teamProfileImage,
        demo: teampost.teamInfo.demoVideo,
        posterImg: teampost.teamInfo.posterImage,
      });
      setExistingSlideImages(teampost.teamInfo.slideImages || []);
    }
  }, [teampost]);

  // 텍스트 입력 처리
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 파일 선택 처리 (팀 프로필, 동영상, 포스터)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: file,
      }));
    }
  };

  // 새 슬라이드 이미지 여러 파일 선택 처리
  const handleSlideImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewSlideImages((prev) => [...prev, ...files]);
    }
  };

  // 기존 슬라이드 이미지 삭제 처리
  const handleDeleteExistingSlideImage = (index: number) => {
    setExistingSlideImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 새 슬라이드 이미지 삭제 처리
  const handleDeleteNewSlideImage = (index: number) => {
    setNewSlideImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 저장 처리 – 모든 이미지/동영상 데이터를 File 객체로 변환하여 전송
  const handleSave = async () => {
    if (!team_uuid) return;

    // teamProfileImage, demo, posterImg가 File 객체가 아니라면 base64 문자열을 File 객체로 변환
    const teamProfileFile =
      editData.teamProfileImage instanceof File
        ? editData.teamProfileImage
        : base64ToFile(editData.teamProfileImage as string, "profile.jpg", "image/jpeg");

    const demoFile =
      editData.demo instanceof File ? editData.demo : base64ToFile(editData.demo as string, "demo.mp4", "video/mp4");

    const posterFile =
      editData.posterImg instanceof File
        ? editData.posterImg
        : base64ToFile(editData.posterImg as string, "poster.jpg", "image/jpeg");

    const formData = new FormData();
    formData.append("encryptedTeamId", "FRAgIFnQMAAAZKFoZUAsHw==");
    formData.append("title", editData.title);
    formData.append("content", editData.content);
    formData.append("category", "GAME");
    formData.append("teamProfileImage", teamProfileFile);
    formData.append("demo", demoFile);
    formData.append("posterImg", posterFile);

    const res = await putTeampost(formData);

    // 슬라이드 이미지는 기존 이미지(변환)와 새로 추가된 파일 모두 File 객체로 전송
    const formDataSlide = new FormData();
    formDataSlide.append("encryptedTeamId", "FRAgIFnQMAAAZKFoZUAsHw==");

    // 기존 슬라이드 이미지(base64 문자열)를 File 객체로 변환하여 추가
    existingSlideImages.forEach((img, idx) => {
      const file = base64ToFile(img, `existing_slide_${idx}.jpg`, "image/jpeg");
      formDataSlide.append("files", file);
    });

    // 새 슬라이드 이미지(File 객체) 추가
    newSlideImages.forEach((file) => {
      formDataSlide.append("files", file);
    });

    const res2 = await putTeampostSlideImage(formDataSlide);
    if (res && res2) {
      navigate(-1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Container>
      <TeamIntro>
        {/* 프로젝트 타이틀 수정 */}
        <EditableInput
          type="text"
          name="title"
          value={editData.title}
          onChange={handleInputChange}
          placeholder="PROJECT TITLE"
        />

        <div style={{ gridRow: "span 2" }}>
          <ImageWrapper onClick={() => document.getElementById("teamProfileInput")?.click()}>
            {/* 프로필 이미지 */}
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
            style={{ display: "none" }} // 파일 입력 숨기기
          />
        </div>
        {/* 프로젝트 설명 수정 */}
        <EditableTextArea
          name="content"
          value={editData.content}
          onChange={handleInputChange}
          placeholder="Enter Project Description"
          rows={6}
        />
      </TeamIntro>

      {/* 슬라이드 이미지 수정 */}
      <SectionTitle>Slide Images</SectionTitle>
      <SlideImageEditor
        existingImages={existingSlideImages}
        newImages={newSlideImages}
        setExistingImages={setExistingSlideImages}
        setNewImages={setNewSlideImages}
      />

      {/* 프로젝트 동영상 수정 */}
      <SectionTitle>Project Video</SectionTitle>
      <DemoVideoEditor base={editData.demo as string} handleFileChange={handleFileChange} />

      {/* <VideoIntro>
        {editData.demo && (
          <TeamVideo controls>
            <source
              src={
                typeof editData.demo === "string"
                  ? `data:video/mp4;base64,${editData.demo}`
                  : URL.createObjectURL(editData.demo)
              }
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </TeamVideo>
        )}
        <FileInput type="file" name="demo" accept="video/*" onChange={handleFileChange} />
      </VideoIntro> */}

      {/* 포스터 수정 */}
      <SectionTitle>Poster</SectionTitle>
      <PosterIntro>
        <PosterImg
          src={
            editData.posterImg
              ? typeof editData.posterImg === "string"
                ? `data:image/jpeg;base64,${editData.posterImg}`
                : URL.createObjectURL(editData.posterImg)
              : empty
          }
          alt="Poster"
        />
        <FileInput type="file" name="posterImg" accept="image/*" onChange={handleFileChange} />
      </PosterIntro>

      {/* 저장 버튼 */}
      <SaveButton onClick={handleSave}>Save</SaveButton>
    </Container>
  );
};

export default TeamEditPage;
