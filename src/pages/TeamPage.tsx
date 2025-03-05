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
  border-radius: 10px;
  background: #c5efff;
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 3rem;
`;

const TeamIntro = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr 6fr;
  box-sizing: border-box;
  padding: 5rem;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 모바일에서는 1열로 표시 */
    grid-template-rows: auto auto; /* 행 간격 조정 */
    padding: 2rem;
  }
`;

const TeamTitle = styled.div`
  border: 1px solid red;
  font-size: 2rem;
  text-align: center;
`;

const TeamContent = styled.div`
  border: 1px solid red;
  font-size: 1.2rem;
`;

const TeamProfile = styled.img`
  width: 100%;
  height: auto;
  box-sizing: border-box;
  object-fit: cover;
  grid-row: span 2;
  border: 1px solid red;

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const StudentInfo = styled.img`
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 5rem;

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

const TeamPage = () => {
  const { year, team_uuid } = useParams();
  // const [searchParams] = useSearchParams();
  // const team_id = searchParams.get("team_id");

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
      <button onClick={() => navigate(`${location.pathname}/edit}`)}>수정</button>

      {seletedAuth.teamName === team_uuid ? (
        <>
          <button>수정</button>
        </>
      ) : (
        <></>
      )}
      <Container>
        <TeamIntro>
          <TeamProfile src={`data:image/jpeg;base64,${teampost?.teamInfo.teamProfileImage}`} />
          <TeamTitle>{teampost?.teamInfo.projectName}</TeamTitle>
          <TeamContent>{teampost?.teamInfo.explanation}</TeamContent>
        </TeamIntro>
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
        <Test />
        <div>
          {teampost?.teamInfo.demoVideo && (
            <video controls style={{ width: "100%", height: "auto" }}>
              <source src={`data:video/mp4;base64,${teampost.teamInfo.demoVideo}`} type="video/mp4" />
              <source src={`data:video/webm;base64,${teampost.teamInfo.demoVideo}`} type="video/webm" />
              <source src={`data:video/ogg;base64,${teampost.teamInfo.demoVideo}`} type="video/ogg" />
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          )}
        </div>
        <div>
          <img
            src={`data:image/jpeg;base64,${teampost?.teamInfo.posterImage}`}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </Container>
    </>
  );
};

export default TeamPage;
