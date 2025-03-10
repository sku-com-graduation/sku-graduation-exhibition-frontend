import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";
import { postGetTeampost } from "../api/teamPost";
import { ITeamPost, ITeamStudent } from "../interface";
import Test from "../components/Test";
import { useModal } from "../hooks/useModal";
import Profile from "../components/Profile";
import empty from "../assets/image/empty.png";
import userEmpty from "../assets/image/userEmpty.png";

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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 2rem;
  }
`;

const TeamTitle = styled.h1`
  font-size: 2.6rem;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.05rem;
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
  letter-spacing: 0.05rem;
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
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  grid-row: span 2;
  transition: transform 0.3s ease-in-out;
  margin: 0 auto;

  &:hover {
    transform: scale(1.05);
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

const StudentIntro = styled.div`
  padding: 0 0.625rem;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`;

const PosterIntro = styled.div`
  width: 100%;
  display: grid;
  place-items: center;
  gap: 100rem;
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

const TeamPage = () => {
  const { year, team_uuid } = useParams();
  const { openModal, Modal } = useModal();

  if (!encodeURIComponent) {
    throw new Error("");
  }

  const dispatch = useDispatch();
  const [teampost, seTeampost] = useState<ITeamPost>();
  const [selectedStudent, setSelectedStudent] = useState<ITeamStudent | null>();

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

  const handleStudentClick = (student: ITeamStudent) => {
    setSelectedStudent(student);
    openModal();
  };

  const seletedAuth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
          <TeamProfile
            src={
              teampost?.teamInfo.teamProfileImage
                ? `data:image/jpeg;base64,${teampost?.teamInfo.teamProfileImage}`
                : empty
            }
          />
          <TeamContent>{teampost?.teamInfo.explanation}</TeamContent>
        </TeamIntro>

        <Test img={teampost?.teamInfo.slideImages} />

        <SectionTitle>Members</SectionTitle>
        <StudentIntro>
          {teampost?.students.map((student, index) => {
            return (
              <div style={{ display: "inline-block", margin: "0 10px" }} key={index}>
                <StudentInfo
                  src={student.profileImage ? `data:image/jpeg;base64,${student.profileImage}` : userEmpty}
                  onClick={() => {
                    handleStudentClick(student);
                  }}
                />
                <div>{student.name}</div>
              </div>
            );
          })}
        </StudentIntro>
        <Modal>{selectedStudent && <Profile selectedStudent={selectedStudent} />}</Modal>

        <SectionTitle>Project Video</SectionTitle>
        <VideoIntro>
          {teampost?.teamInfo.demoVideo && (
            <TeamVideo controls>
              <source src={`data:video/mp4;base64,${teampost?.teamInfo.demoVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </TeamVideo>
          )}
        </VideoIntro>

        <SectionTitle>Poster</SectionTitle>
        <PosterIntro>
          <PosterImg
            src={teampost?.teamInfo.posterImage ? `data:image/jpeg;base64,${teampost?.teamInfo.posterImage}` : empty}
          />
        </PosterIntro>
      </Container>
    </>
  );
};

export default TeamPage;
