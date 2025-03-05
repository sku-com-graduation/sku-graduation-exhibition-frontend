import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";
import { postGetTeampost } from "../api/teamPost";
import { ITeamPost } from "../types/ITeamPost";
import Test from "../components/Test";

const Container = styled.div`
  width: 100%;
  /* background: #eff5ff; */
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
  letter-spacing: 2px;
`;

const TeamIntro = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1.5fr 1fr; /* 이미지와 텍스트의 비율을 1:1.5로 설정 */
  grid-template-rows: auto 1fr;
  gap: 2rem;
  box-sizing: border-box;
  padding: 4rem;
  border-radius: 1rem;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); /* 부드러운 그림자 추가 */

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 모바일에서 이미지와 텍스트를 세로로 배치 */
    grid-template-rows: auto auto;
    padding: 2rem;
  }
`;

const TeamTitle = styled.h1`
  font-size: 2.6rem;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.5px;
  margin-bottom: 1rem;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
    font-size: 2.2rem;
  }
`;

const TeamContent = styled.div`
  width: 80%;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  letter-spacing: 0.5px;
  text-align: justify;
  padding: 0.5rem 0;
  white-space: pre-line;
  margin-top: 1rem;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const TeamProfile = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 1rem; /* 둥근 이미지 */
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  grid-row: span 2;
  transition: transform 0.3s ease-in-out;
  margin: 0 auto;

  &:hover {
    transform: scale(1.05); /* 호버시 이미지 확대 효과 */
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

const StudentInfo = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 5rem;
  object-fit: cover;
  @media (max-width: 768px) {
    width: 4.5rem;
    height: 4.5rem;
  }
`;

const StudentIntro = styled.div`
  padding: 0 0.625rem;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
`;

const PosterIntro = styled.div`
  width: 100%;
  display: grid;
  place-items: center; /* 수평 및 수직 중앙 정렬 */
`;

const PosterImg = styled.img`
  width: 50%;
  height: auto; /* 비율에 맞게 높이를 자동으로 조절 */
  object-fit: cover;
  max-width: 100%; /* 화면 크기 변화에 맞게 크기 조절 */

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
  }
`;

const TeamPage = () => {
  const { year, team_uuid } = useParams();

  if (!encodeURIComponent) {
    throw new Error("");
  }

  const dispatch = useDispatch();
  const [teampost, seTeampost] = useState<ITeamPost>();

  const selectedExhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

  useEffect(() => {
    if (!selectedExhibitionYear && year) {
      dispatch(setExhibitionYear(year));
    }
  }, [selectedExhibitionYear, year, dispatch]);

  const getTeampost = async (team_id: string) => {
    const res = await postGetTeampost(team_id);
    seTeampost(res);
  };

  useEffect(() => {
    if (team_uuid) getTeampost(team_uuid);
  }, [team_uuid]);

  const seletedAuth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {seletedAuth.teamName === team_uuid ||
        (seletedAuth.teamName === "admin" && (
          <>
            <button onClick={() => navigate(`${location.pathname}/edit}`)}>Edit</button>
          </>
        ))}
      <Container>
        <TeamIntro>
          <TeamTitle>{teampost?.teamInfo.projectName}</TeamTitle>
          <TeamProfile src={`data:image/jpeg;base64,${teampost?.teamInfo.teamProfileImage}`} />
          <TeamContent>{teampost?.teamInfo.explanation}</TeamContent>
        </TeamIntro>

        <Test />

        <SectionTitle>Crew</SectionTitle>
        <StudentIntro>
          {teampost?.students.map((student, index) => {
            return (
              <div style={{ display: "inline-block", margin: "0 10px" }} key={index}>
                <StudentInfo src={`data:image/jpeg;base64,${student.profileImage}`} />
                <div>{student.name}</div>
              </div>
            );
          })}
        </StudentIntro>

        {/* 비디오 섹션 제목 변경 */}
        <SectionTitle>Project Video</SectionTitle>
        <VideoIntro>
          {teampost?.teamInfo.demoVideo && (
            <TeamVideo controls>
              <source src={`data:video/mp4;base64,${teampost?.teamInfo.demoVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </TeamVideo>
          )}
        </VideoIntro>

        {/* 포스터 섹션 제목 변경 */}
        <SectionTitle>Poster</SectionTitle>
        <PosterIntro>
          <PosterImg src={`data:image/jpeg;base64,${teampost?.teamInfo.posterImage}`} />
        </PosterIntro>
      </Container>
    </>
  );
};

export default TeamPage;
