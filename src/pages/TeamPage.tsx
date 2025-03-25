import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";
import { postGetTeampost } from "../api/teamPost";
import { IProject, ITeamPost, ITeamStudent } from "../interface";
// import SlideImage from "../components/SlideImage";
import { useModal } from "../hooks/useModal";
import Profile from "../components/Profile";
import empty from "../assets/image/empty.png";
import userEmpty from "../assets/image/userEmpty.png";
import { getProjects } from "@src/api/team";
import { ArrowleftIcon, ArrowRightIcon } from "@components/Icons";
import { motion } from "framer-motion";

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

const EditButton = styled.button`
  position: fixed;
  top: 5rem;
  right: 2rem;
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  z-index: 5000;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #357ab8;
    transform: translateY(-0.2rem);
  }
`;

const SideButton = styled(motion.button)`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  border: none;
  border-radius: 50%;

  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.2);
  }
`;

const PrevButton = styled(SideButton)`
  left: 1rem;
`;

const NextButton = styled(SideButton)`
  right: 1rem;
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

const SlideImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const TeamPage = () => {
  const { year, team_uuid } = useParams();
  const { openModal, Modal } = useModal();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector((state: RootState) => state.auth);
  const exhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

  const [teampost, setTeampost] = useState<ITeamPost>();
  const [selectedStudent, setSelectedStudent] = useState<ITeamStudent | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);

  const fetchProjects = async (year: string) => {
    try {
      const res: IProject[] = await getProjects(year);
      const sortedProjects = res.sort((a, b) => a.teamName.localeCompare(b.teamName));
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTeampost = async (teamId: string) => {
    try {
      const res = await postGetTeampost(teamId);
      setTeampost(res);
    } catch (error) {
      console.error("Error fetching team post:", error);
    }
  };

  useEffect(() => {
    if (year) {
      fetchProjects(year);
      if (!exhibitionYear) {
        dispatch(setExhibitionYear(year));
      }
    }
  }, [year, exhibitionYear, dispatch]);

  useEffect(() => {
    if (team_uuid) {
      fetchTeampost(team_uuid);
    }
  }, [team_uuid]);

  const navigateProject = (direction: "prev" | "next") => {
    if (!teampost || projects.length === 0) return;
    const currentIndex = projects.findIndex((project) => project.uuid === team_uuid);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? (currentIndex - 1 + projects.length) % projects.length : (currentIndex + 1) % projects.length;
    const newTeamId = projects[newIndex].uuid;
    navigate(`/${year}/project/${newTeamId}`);
  };

  const handleStudentClick = (student: ITeamStudent) => {
    setSelectedStudent(student);
    openModal();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <>
      {(auth.uuid === team_uuid || auth.teamName === "admin") && <EditButton onClick={() => navigate(`${location.pathname}/edit`)}>EDIT</EditButton>}

      <PrevButton
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, ease: "easeOut" }}
        onClick={() => navigateProject("prev")}
      >
        <ArrowleftIcon />
      </PrevButton>

      <NextButton
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, ease: "easeOut" }}
        onClick={() => navigateProject("next")}
      >
        <ArrowRightIcon />
      </NextButton>

      <Container>
        <TeamIntro>
          <TeamTitle>{teampost?.teamInfo.projectName}</TeamTitle>
          <TeamProfile src={teampost?.teamInfo.teamProfileImage ? `data:image/jpeg;base64,${teampost.teamInfo.teamProfileImage}` : empty} />
          <TeamContent>{teampost?.teamInfo.explanation}</TeamContent>
        </TeamIntro>

        {/* <SlideImage img={teampost?.teamInfo.slideImages} /> */}

        <SectionTitle>Members</SectionTitle>
        <StudentList>
          {teampost?.students.map((student, index) => (
            <StudentItem key={index} onClick={() => handleStudentClick(student)}>
              <StudentInfo src={student.profileImage ? `data:image/jpeg;base64,${student.profileImage}` : userEmpty} />
              <StudentName>{student.name}</StudentName>
            </StudentItem>
          ))}
        </StudentList>
        <Modal>{selectedStudent && <Profile selectedStudent={selectedStudent} teamUuid={team_uuid} />}</Modal>

        <SectionTitle>Project Video</SectionTitle>
        <VideoIntro>
          {teampost?.teamInfo.demoVideo && (
            <TeamVideo controls>
              <source src={`data:video/mp4;base64,${teampost.teamInfo.demoVideo}`} type="video/mp4" />
              Your browser does not support the video tag.
            </TeamVideo>
          )}
        </VideoIntro>

        <SectionTitle>Poster</SectionTitle>
        <PosterIntro>
          <PosterImg src={teampost?.teamInfo.posterImage ? `data:image/jpeg;base64,${teampost.teamInfo.posterImage}` : empty} />
        </PosterIntro>
      </Container>
    </>
  );
};

export default TeamPage;
