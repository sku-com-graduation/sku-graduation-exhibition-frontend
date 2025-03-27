import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { postGetTeampost, putTeampost, putTeampostSlideImage } from "../api/teamPost";
import { ITeamPost } from "../interface";
import empty from "../assets/image/img3.png";
import SlideImageEditor from "@components/SlideImageEditor";
import DemoVideoEditor from "@components/DemoVideoEditor";
import { AddArea, EditableTextArea, EditableTitle, FileInput } from "@components/ui/Input";
import base64ToFile from "@src/utils/base64ToFile";

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

  // 포스터 파일 입력에 대한 ref 추가
  const posterInputRef = useRef<HTMLInputElement>(null);

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

  // 저장 처리 – 모든 이미지/동영상 데이터를 File 객체로 변환하여 전송
  const handleSave = async () => {
    if (!team_uuid) return;

    // teamProfileImage, demo, posterImg가 File 객체가 아니라면 base64 문자열을 File 객체로 변환
    const teamProfileFile =
      editData.teamProfileImage instanceof File
        ? editData.teamProfileImage
        : base64ToFile(editData.teamProfileImage as string, "profile.jpg", "image/jpeg");

    const demoFile = editData.demo instanceof File ? editData.demo : base64ToFile(editData.demo as string, "demo.mp4", "video/mp4");

    const posterFile =
      editData.posterImg instanceof File ? editData.posterImg : base64ToFile(editData.posterImg as string, "poster.jpg", "image/jpeg");

    const formData = new FormData();
    formData.append("teamUuid", team_uuid);
    formData.append("title", editData.title);
    formData.append("content", editData.content);
    formData.append("category", "GAME");
    formData.append("teamProfileImage", teamProfileFile);
    formData.append("demo", demoFile);
    formData.append("posterImg", posterFile);

    const res = await putTeampost(formData);

    // 슬라이드 이미지는 기존 이미지(변환)와 새로 추가된 파일 모두 File 객체로 전송
    const formDataSlide = new FormData();
    formDataSlide.append("teamUuid", team_uuid);

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
        <EditableTitle type="text" name="title" value={editData.title} onChange={handleInputChange} placeholder="PROJECT TITLE" />

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
          maxLength={500}
        />
        <CharCount>{(editData.content || "").length} / 500</CharCount>
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
        <AddArea onClick={() => posterInputRef.current?.click()}>Add Poster</AddArea>
        <FileInput ref={posterInputRef} type="file" name="posterImg" accept="image/*" onChange={handleFileChange} />
      </PosterIntro>

      {/* 저장 버튼 */}
      <SaveButton onClick={handleSave}>SAVE</SaveButton>
    </Container>
  );
};

export default TeamEditPage;
