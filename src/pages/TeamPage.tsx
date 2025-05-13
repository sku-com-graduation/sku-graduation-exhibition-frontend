import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

import { RootState } from "@store/store";
import { setExhibitionYear } from "@store/reducers/exhibitionYear";
import { postGetTeampost } from "@api/teamPost";
import { getProjects } from "@api/team";
import { useModal } from "@hooks";

import { IProject, ITeamPost, ITeamStudent } from "@interface";
import { IprofessorInfo } from "src/interface/ITeamPost";

import empty from "@assets/image/main_image.png";
import userEmpty from "@assets/image/user.png";

import ProfileView from "@components/ProfileView";
import ProfessorProfileView from "@components/ProfessorProfileView";

// =================== Styled Components ===================
const StudentBadge = styled.div`
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #ffffff;
  background-color: #2a4fa4;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  display: inline-block;
`;
const ProfessorBadge = styled(StudentBadge)`
  background-color: #8a2be2;
`;

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 3rem;
  place-items: center;
  padding-top: 5rem;
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
  padding: 4rem;
  box-sizing: border-box;
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
    margin: 0 auto;
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
  }
`;

const VideoIntro = styled.div`
  width: 100%;
  max-width: 80rem;
  overflow: hidden;
  padding: 1rem;
`;
const EmptyVideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #f0f0f0;
  border: 0.2rem dashed #ccc;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
`;
const TeamVideo = styled.video`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1rem;
`;

const PosterIntro = styled.div`
  width: 50%;
  display: grid;
  place-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;
const PosterImg = styled.img`
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: contain;
  border-radius: 1rem;
`;

const EditButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
`;

const SideButton = styled(motion.button)`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.8rem;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border: none;
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

const MemberList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
`;
const StudentItem = styled.div`
  text-align: center;
`;
const ProfessorItem = styled.div`
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
const ProfessorName = styled(StudentName)``;

// ================ Table of Contents =================
// const TocWrapper = styled.ul`
//   position: fixed;
//   bottom: 5rem;
//   right: 2rem;
//   background: rgba(255, 255, 255, 0.9);
//   padding: 1rem;
//   border-radius: 0.5rem;
//   box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
//   list-style: none;
//   max-width: 200px;
//   font-size: 0.9rem;
// `;
const TocWrapper = styled.ul`
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  list-style: none;

  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.85rem;
  z-index: 1000;
`;

const TocItem = styled.li<{ active: boolean }>`
  margin: 0.5rem 0;
  a {
    color: ${({ active }) => (active ? "#0070f3" : "#333")};
    font-weight: ${({ active }) => (active ? 600 : 400)};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface TocEntry {
  id: string;
  label: string;
}

// export function TableOfContents({ entries }: { entries: TocEntry[] }) {
//   const [activeId, setActiveId] = useState<string>(entries[0]?.id);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (ioEntries) => {
//         ioEntries.forEach((e) => {
//           if (e.isIntersecting) {
//             setActiveId(e.target.id);
//           }
//         });
//       },
//       {
//         root: null,
//         rootMargin: "-45% 0px -55% 0px",
//         threshold: 0,
//       }
//     );

//     entries.forEach(({ id }) => {
//       const el = document.getElementById(id);
//       if (el) observer.observe(el);
//     });

//     return () => observer.disconnect();
//   }, [entries]);

//   const handleClick = (e: React.MouseEvent, id: string) => {
//     e.preventDefault();
//     const el = document.getElementById(id);
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth", block: "start" });
//       setActiveId(id);
//     }
//   };

//   return (
//     <TocWrapper>
//       {entries.map(({ id, label }) => (
//         <TocItem key={id} active={id === activeId}>
//           <a href={`#${id}`} onClick={(e) => handleClick(e, id)}>
//             {label}
//           </a>
//         </TocItem>
//       ))}
//     </TocWrapper>
//   );
// }

// ===================== Main Component =====================

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id || "");
  const lockRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-45% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [entries]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      lockRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveId(id);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lockRef.current = false;
      }, 1500);
    }
  };

  return (
    <TocWrapper>
      {entries.map(({ id, label }) => (
        <TocItem key={id} active={id === activeId}>
          <a href={`#${id}`} onClick={(e) => handleClick(e, id)}>
            {label}
          </a>
        </TocItem>
      ))}
    </TocWrapper>
  );
}

const TeamPage: React.FC = () => {
  const { year, team_uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal, Modal, isOpen } = useModal();
  const auth = useSelector((state: RootState) => state.auth);
  const exhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

  const [teampost, setTeampost] = useState<ITeamPost>();
  const [selectedStudent, setSelectedStudent] = useState<ITeamStudent | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<IprofessorInfo | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedStudent(null);
      setSelectedProfessor(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (year) {
      fetchProjects(year);
      if (!exhibitionYear) dispatch(setExhibitionYear(year));
    }
  }, [year, exhibitionYear, dispatch]);

  useEffect(() => {
    if (team_uuid) fetchTeampost(team_uuid);
  }, [team_uuid]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const fetchProjects = async (yearStr: string) => {
    try {
      const res = await getProjects(yearStr);
      setProjects(res.sort((a, b) => a.teamName.localeCompare(b.teamName)));
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTeampost = async (teamId: string) => {
    try {
      const res = await postGetTeampost(teamId);
      setTeampost(res);
    } catch (error) {
      console.error(error);
    }
  };
  const navigateProject = (dir: "prev" | "next") => {
    if (!teampost || !projects.length) return;
    const idx = projects.findIndex((p) => p.uuid === team_uuid);
    if (idx === -1) return;
    const newIdx = dir === "prev" ? (idx - 1 + projects.length) % projects.length : (idx + 1) % projects.length;
    navigate(`/${year}/project/${projects[newIdx].uuid}`);
  };
  const handleStudentClick = (s: ITeamStudent) => {
    setSelectedStudent(s);
    openModal();
  };

  const tocEntries: TocEntry[] = [
    { id: "intro", label: "Team Intro" },
    { id: "members", label: "Members" },
    { id: "project-video", label: "Project Video" },
    { id: "poster", label: "Poster" },
  ];

  return (
    <>
      {(auth.uuid === team_uuid || auth.role === "ADMIN") && (
        <EditButton onClick={() => navigate(`${location.pathname}/edit`)}>EDIT</EditButton>
      )}
      <PrevButton onClick={() => navigateProject("prev")}>←</PrevButton>
      <NextButton onClick={() => navigateProject("next")}>→</NextButton>

      <Container>
        <TeamIntro id="intro">
          <TeamTitle>{teampost?.teamInfo.title || "PROJECT TITLE"}</TeamTitle>
          <TeamProfile src={teampost?.teamInfo.teamProfileImage || empty} />
          <TeamContent>{teampost?.teamInfo.content || "PROJECT DESCRIPTION"}</TeamContent>
        </TeamIntro>

        <SectionTitle id="members">Members</SectionTitle>
        <MemberList>
          {teampost?.professorInfo.professorName && (
            <ProfessorItem
              onClick={() => {
                setSelectedProfessor(teampost.professorInfo);
                openModal();
              }}
            >
              <StudentInfo src={teampost.professorInfo.professorImage || userEmpty} />
              <ProfessorName>{teampost.professorInfo.professorName}</ProfessorName>
              <ProfessorBadge>지도교수</ProfessorBadge>
            </ProfessorItem>
          )}
          {teampost?.students
            .slice()
            .sort((a, b) => {
              if (a.role === "LEADER" && b.role !== "LEADER") return -1;
              if (a.role !== "LEADER" && b.role === "LEADER") return 1;
              return a.name.localeCompare(b.name);
            })
            .map((s, i) => (
              <StudentItem key={i} onClick={() => handleStudentClick(s)}>
                <StudentInfo src={s.profileImage || userEmpty} />
                <StudentName>{s.name}</StudentName>
                {s.role === "LEADER" && <StudentBadge>팀장</StudentBadge>}
              </StudentItem>
            ))}
        </MemberList>

        <Modal>
          {selectedStudent && <ProfileView student={selectedStudent} />}
          {selectedProfessor && <ProfessorProfileView professor={selectedProfessor} />}
        </Modal>

        <SectionTitle id="project-video">Project Video</SectionTitle>
        <VideoIntro>
          {teampost?.teamInfo.demoVideo ? (
            <TeamVideo controls>
              <source src={teampost.teamInfo.demoVideo} type="video/mp4" />
            </TeamVideo>
          ) : (
            <EmptyVideoPlaceholder>프로젝트 영상이 업로드되지 않았습니다.</EmptyVideoPlaceholder>
          )}
        </VideoIntro>

        <SectionTitle id="poster">Poster</SectionTitle>
        <PosterIntro>
          {teampost?.teamInfo.posterImage ? (
            <PosterImg src={teampost.teamInfo.posterImage} />
          ) : (
            <EmptyVideoPlaceholder>포스터가 업로드되지 않았습니다.</EmptyVideoPlaceholder>
          )}
        </PosterIntro>
      </Container>

      <TableOfContents entries={tocEntries} />
    </>
  );
};

export default TeamPage;

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import styled from "styled-components";
// import { motion } from "framer-motion";

// import { RootState } from "@store/store";
// import { setExhibitionYear } from "@store/reducers/exhibitionYear";
// import { postGetTeampost } from "@api/teamPost";
// import { getProjects } from "@api/team";
// import { useModal } from "@hooks";

// import { IProject, ITeamPost, ITeamStudent } from "@interface";
// import { IprofessorInfo } from "src/interface/ITeamPost"; // 교수 정보 타입

// import empty from "@assets/image/main_image.png";
// import userEmpty from "@assets/image/user.png";

// import ProfileView from "@components/ProfileView";
// import ProfessorProfileView from "@components/ProfessorProfileView";

// /* ────────────────
//    Styled Components
//    ──────────────── */

// // 학생/교수용 뱃지
// const StudentBadge = styled.div`
//   margin-top: 0.3rem;
//   font-size: 0.8rem;
//   color: #ffffff;
//   background-color: #2a4fa4;
//   padding: 0.2rem 0.6rem;
//   border-radius: 0.5rem;
//   display: inline-block;
// `;

// const ProfessorBadge = styled(StudentBadge)`
//   background-color: #8a2be2;
// `;

// // 전체 화면 컨테이너
// const Container = styled.div`
//   width: 100%;
//   display: grid;
//   grid-template-rows: repeat(5, auto);
//   gap: 3rem;
//   place-items: center;
//   padding-top: 5rem;
// `;

// // 섹션 타이틀
// const SectionTitle = styled.h2`
//   font-size: 2rem;
//   font-weight: 600;
//   color: #333;
//   margin-bottom: 1rem;
//   text-align: center;
//   text-transform: uppercase;
//   letter-spacing: 0.2rem;
// `;

// // 팀 소개 섹션 레이아웃
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

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     grid-template-rows: auto auto;
//     padding: 2rem;
//   }
// `;

// // 팀 프로젝트 제목
// const TeamTitle = styled.h1`
//   font-size: 2.6rem;
//   font-weight: 700;
//   color: #333;
//   letter-spacing: -0.05rem;
//   margin-bottom: 1rem;
//   text-align: left;

//   @media (max-width: 768px) {
//     text-align: center;
//     font-size: 2.2rem;
//   }
// `;

// // 팀 프로젝트 설명
// const TeamContent = styled.div`
//   width: 80%;
//   font-size: 1.1rem;
//   color: #666;
//   line-height: 1.8;
//   letter-spacing: 0.05rem;
//   text-align: justify;
//   padding: 0.5rem 0;
//   white-space: pre-line;
//   margin-top: 1rem;

//   @media (max-width: 768px) {
//     margin: 0px auto;
//   }
// `;

// // 팀 프로필 이미지
// const TeamProfile = styled.img`
//   width: 100%;
//   aspect-ratio: 1 / 1;
//   object-fit: cover;
//   border-radius: 1rem;
//   box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
//   grid-row: span 2;
//   transition: transform 0.3s ease-in-out;
//   margin: 0 auto;

//   &:hover {
//     transform: scale(1.05);
//   }

//   @media (max-width: 768px) {
//     width: 15rem;
//     height: 15rem;
//     margin: 0 auto;
//   }
// `;

// // 동영상 섹션 래퍼
// const VideoIntro = styled.div`
//   width: 100%;
//   max-width: 80rem;
//   overflow: hidden;
//   padding: 1rem;
//   box-sizing: border-box;
// `;

// const EmptyVideoPlaceholder = styled.div`
//   width: 100%;
//   aspect-ratio: 16 / 9;
//   background-color: #f0f0f0;
//   border: 0.2rem dashed #ccc;
//   border-radius: 1rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #888;
//   font-size: 1.2rem;
//   font-weight: 500;
//   text-align: center;
// `;

// // 동영상 태그
// const TeamVideo = styled.video`
//   width: 100%;
//   aspect-ratio: 16 / 9;
//   object-fit: cover;
//   border-radius: 1rem;
// `;

// // 포스터 섹션 래퍼
// const PosterIntro = styled.div`
//   width: 50%;
//   display: grid;
//   place-items: center;

//   @media (max-width: 768px) {
//     width: 100%;
//   }
// `;

// // 포스터 이미지
// const PosterImg = styled.img`
//   width: 100%;
//   aspect-ratio: 3 / 4; // 포스터 비율에 맞게 조정
//   object-fit: contain;
//   border-radius: 1rem;

//   @media (max-width: 768px) {
//     width: 100%;
//   }
// `;

// // 수정 버튼 (EDIT)
// const EditButton = styled.button`
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
//     /* background-color: #357ab8; */
//   }

//   @media (max-width: 768px) {
//     bottom: 1rem;
//     right: 1rem;
//     padding: 0.6rem 1.5rem;
//     font-size: 0.9rem;
//   }
// `;

// const SideButton = styled(motion.button)`
//   width: 3rem;
//   height: 3rem;
//   border-radius: 50%;

//   position: fixed;
//   top: 50%;
//   transform: translateY(-50%);
//   padding: 0.8rem 1rem;
//   background: linear-gradient(135deg, #6e8efb, #a777e3);
//   color: white;
//   border: none;

//   box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
//   transition: transform 0.3s ease, box-shadow 0.3s ease;
//   z-index: 1000;

//   &:hover {
//     transform: translateY(-50%) scale(1.1);
//     box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.2);
//   }
// `;

// const PrevButton = styled(SideButton)`
//   left: 1rem;
// `;

// const NextButton = styled(SideButton)`
//   right: 1rem;
// `;

// // 멤버 리스트 컨테이너
// const MemberList = styled.div`
//   display: flex;
//   justify-content: center;
//   flex-wrap: wrap;
//   gap: 1rem;
// `;

// // 학생 아이템
// const StudentItem = styled.div`
//   text-align: center;
// `;

// // 교수 아이템
// const ProfessorItem = styled.div`
//   text-align: center;
// `;

// // 학생/교수 프로필 썸네일
// const StudentInfo = styled.img`
//   width: 10rem;
//   height: 10rem;
//   border-radius: 5rem;
//   border: 0.1rem solid #d8d8d8;
//   object-fit: cover;
//   transition: filter 0.3s ease-in-out;
//   image-rendering: auto;

//   &:hover {
//     filter: brightness(50%);
//   }

//   @media (max-width: 768px) {
//     width: 4.5rem;
//     height: 4.5rem;
//   }
// `;

// // 학생 이름
// const StudentName = styled.div`
//   margin-top: 0.5rem;
// `;

// // 교수 이름 (스타일만 다르게)
// const ProfessorName = styled(StudentName)`
//   /* font-weight: 600;
//   color: #2a4fa4; */
// `;

// // 슬라이드 전체 래퍼
// const SlideWrapper = styled.div`
//   width: 100%;
//   overflow: hidden;
//   max-width: 100rem;
// `;

// // 슬라이드 트랙(무한 슬라이드)
// const SlideTrack = styled(motion.div)`
//   display: flex;
//   width: fit-content;
//   gap: 1rem;
// `;

// // 슬라이드 이미지 아이템
// const SlideImageItem = styled.img`
//   width: 15rem;
//   height: 10rem;
//   object-fit: cover;
//   border-radius: 1rem;
//   flex-shrink: 0;
//   box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
// `;

// /* 슬라이드 캐러셀 컴포넌트 */
// const SlideCarousel = ({ images }: { images: string[] }) => {
//   // 무한 루프를 위해 이미지 배열을 여러 번 복제
//   const duplicatedImages = [
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//     ...images,
//   ];
//   // rem 단위 -> 대략 16px/1rem 가정
//   const totalWidth = images.length * 16; // (이미지 하나당 가로폭 15rem + 여백 약 1rem)

//   return (
//     <SlideWrapper>
//       <SlideTrack
//         animate={{ x: ["0%", `-${totalWidth}rem`] }}
//         transition={{
//           repeat: Infinity,
//           ease: "linear",
//           duration: 30,
//         }}
//       >
//         {duplicatedImages.map((img, index) => (
//           <SlideImageItem key={index} src={img} />
//         ))}
//       </SlideTrack>
//     </SlideWrapper>
//   );
// };

// /* ────────────────
//    메인 컴포넌트
//    ──────────────── */
// const TeamPage = () => {
//   const { year, team_uuid } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { openModal, Modal, isOpen } = useModal();
//   const auth = useSelector((state: RootState) => state.auth);
//   const exhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

//   // 팀 페이지 데이터
//   const [teampost, setTeampost] = useState<ITeamPost>();

//   // 모달로 열 학생 / 교수 선택
//   const [selectedStudent, setSelectedStudent] = useState<ITeamStudent | null>(null);
//   const [selectedProfessor, setSelectedProfessor] = useState<IprofessorInfo | null>(null);

//   // 프로젝트 목록
//   const [projects, setProjects] = useState<IProject[]>([]);

//   /* 모달 닫힐 때마다 선택한 학생/교수 초기화 */
//   useEffect(() => {
//     if (!isOpen) {
//       setSelectedStudent(null);
//       setSelectedProfessor(null);
//     }
//   }, [isOpen]);

//   /* 전시 연도 셋팅 + 프로젝트 목록 불러오기 */
//   useEffect(() => {
//     if (year) {
//       fetchProjects(year);
//       if (!exhibitionYear) {
//         dispatch(setExhibitionYear(year));
//       }
//     }
//   }, [year, exhibitionYear, dispatch]);

//   /* 특정 팀 데이터 불러오기 */
//   useEffect(() => {
//     if (team_uuid) {
//       fetchTeampost(team_uuid);
//     }
//   }, [team_uuid]);

//   /* 페이지 이동 시 스크롤 맨 위로 */
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   /* 전시연도별 팀 목록 가져오기 */
//   const fetchProjects = async (yearStr: string) => {
//     try {
//       const res = await getProjects(yearStr);
//       // 팀명 순 정렬
//       const sortedProjects = res.sort((a, b) => a.teamName.localeCompare(b.teamName));
//       setProjects(sortedProjects);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//     }
//   };

//   /* 특정 팀 데이터(ITeamPost) 불러오기 */
//   const fetchTeampost = async (teamId: string) => {
//     try {
//       const res = await postGetTeampost(teamId);
//       setTeampost(res);
//     } catch (error) {
//       console.error("Error fetching team post:", error);
//     }
//   };

//   /* 이전/다음 팀 이동하기 */
//   const navigateProject = (direction: "prev" | "next") => {
//     if (!teampost || projects.length === 0) return;

//     const currentIndex = projects.findIndex((project) => project.uuid === team_uuid);
//     if (currentIndex === -1) return;

//     const newIndex =
//       direction === "prev"
//         ? (currentIndex - 1 + projects.length) % projects.length
//         : (currentIndex + 1) % projects.length;
//     const newTeamId = projects[newIndex].uuid;
//     navigate(`/${year}/project/${newTeamId}`);
//   };

//   /* 학생 클릭 시 모달 */
//   const handleStudentClick = (student: ITeamStudent) => {
//     setSelectedStudent(student);
//     openModal();
//   };

//   /* 프리뷰 애니메이션 */
//   const buttonVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1 },
//   };

//   return (
//     <>
//       {/* 권한자만 EDIT 보이게 */}
//       {(auth.uuid === team_uuid || auth.role === "ADMIN") && (
//         <EditButton onClick={() => navigate(`${location.pathname}/edit`)}>EDIT</EditButton>
//       )}

//       {/* 이전/다음 팀 이동 버튼 */}
//       <PrevButton
//         variants={buttonVariants}
//         initial="hidden"
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1, delay: 0.3 }}
//         onClick={() => navigateProject("prev")}
//       >
//         ←
//       </PrevButton>
//       <NextButton
//         variants={buttonVariants}
//         initial="hidden"
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1, delay: 0.3 }}
//         onClick={() => navigateProject("next")}
//       >
//         →
//       </NextButton>

//       {/* 메인 컨테이너 */}
//       <Container>
//         {/* 팀 소개 섹션 */}
//         <TeamIntro>
//           <TeamTitle>{teampost?.teamInfo.title ? teampost?.teamInfo.title : "PROJECT TITLE"}</TeamTitle>
//           <TeamProfile src={teampost?.teamInfo.teamProfileImage ? teampost.teamInfo.teamProfileImage : empty} />
//           <TeamContent>{teampost?.teamInfo.content ? teampost?.teamInfo.content : "PROJECT DESCRIPTION"}</TeamContent>
//         </TeamIntro>

//         {/* 슬라이드 이미지
//         {teampost?.teamInfo.slideImages && teampost.teamInfo.slideImages.length > 0 && (
//           <SlideCarousel images={teampost.teamInfo.slideImages} />
//         )} */}

//         {/* 멤버 섹션 */}
//         <SectionTitle>Members</SectionTitle>
//         <MemberList>
//           {/* 지도교수 */}
//           {teampost?.professorInfo.professorName && (
//             <ProfessorItem
//               onClick={() => {
//                 setSelectedProfessor(teampost.professorInfo);
//                 openModal();
//               }}
//             >
//               <StudentInfo
//                 src={teampost.professorInfo.professorImage ? teampost.professorInfo.professorImage : userEmpty}
//               />
//               <ProfessorName>{teampost.professorInfo.professorName}</ProfessorName>
//               {/* 지도교수 뱃지 */}
//               <ProfessorBadge>지도교수</ProfessorBadge>
//             </ProfessorItem>
//           )}

//           {/* 학생 목록 */}
//           {teampost?.students
//             .slice()
//             .sort((a, b) => {
//               if (a.role === "LEADER" && b.role !== "LEADER") return -1;
//               if (a.role !== "LEADER" && b.role === "LEADER") return 1;
//               return a.name.localeCompare(b.name);
//             })
//             .map((student, index) => (
//               <StudentItem key={index} onClick={() => handleStudentClick(student)}>
//                 <StudentInfo src={student.profileImage ? student.profileImage : userEmpty} />
//                 <StudentName>{student.name}</StudentName>
//                 {student.role === "LEADER" && <StudentBadge>팀장</StudentBadge>}
//               </StudentItem>
//             ))}
//         </MemberList>

//         {/* 모달 (학생 or 교수) */}
//         <Modal>
//           {selectedStudent && <ProfileView student={selectedStudent} />}
//           {selectedProfessor && <ProfessorProfileView professor={selectedProfessor} />}
//         </Modal>

//         {/* 프로젝트 영상 섹션 */}
//         <SectionTitle>Project Video</SectionTitle>
//         <VideoIntro>
//           {teampost?.teamInfo.demoVideo ? (
//             <TeamVideo controls>
//               <source src={teampost.teamInfo.demoVideo} type="video/mp4" />
//               Your browser does not support the video tag.
//             </TeamVideo>
//           ) : (
//             <EmptyVideoPlaceholder>
//               <p>프로젝트 영상이 업로드되지 않았습니다.</p>
//             </EmptyVideoPlaceholder>
//           )}
//         </VideoIntro>

//         {/* 포스터 섹션 */}
//         <SectionTitle>Poster</SectionTitle>
//         <PosterIntro>
//           {teampost?.teamInfo.posterImage ? (
//             <PosterImg src={teampost?.teamInfo.posterImage} />
//           ) : (
//             <EmptyVideoPlaceholder>
//               <p>포스터가 업로드되지 않았습니다.</p>
//             </EmptyVideoPlaceholder>
//           )}
//         </PosterIntro>
//       </Container>
//     </>
//   );
// };

// export default TeamPage;
