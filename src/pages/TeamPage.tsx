import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

import {
  Container,
  SectionTitle,
  TeamIntro,
  TeamTitle,
  TeamProfile,
  TeamContent,
  MemberList,
  StudentItem,
  ProfessorItem,
  StudentInfo,
  StudentName,
  ProfessorName,
  StudentBadge,
  ProfessorBadge,
  VideoIntro,
  TeamVideo,
  PosterIntro,
  PosterImg,
  EditButton,
  PrevButton,
  NextButton,
  TocWrapper,
  TocItem,
} from "./TeamPage.styled";

interface TocEntry {
  id: string;
  label: string;
}

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
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id); // ← 가장 화면 위에 가까운 것
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0.05,
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
          <a href="#" onClick={(e) => handleClick(e, id)}>
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

  const [profileImageUrl, setProfileImageUrl] = useState<string>(empty);
  const [posterReadyUrl, setPosterReadyUrl] = useState<string | null>(null);
  const [demoReadyUrl, setDemoReadyUrl] = useState<string | null>(null);

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
  }, [team_uuid, location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const fetchProjects = async (yearStr: string) => {
    try {
      const res = await getProjects(yearStr);
      setProjects(res.sort((a, b) => a.teamName.localeCompare(b.teamName)));
    } catch (error) {
      console.error();
    }
  };

  const fetchTeampost = async (teamId: string) => {
    try {
      const res = await postGetTeampost(teamId);
      setTeampost(res);
    } catch (error) {
      console.error();
    }
  };

  useEffect(() => {
    if (teampost) {
      const now = Date.now();
      const profile = teampost.teamInfo.teamProfileImage;
      setProfileImageUrl(profile ? `${profile}?v=${now}` : empty);

      const poster = teampost.teamInfo.posterImage;
      if (poster) {
        const url = `${poster}?v=${now}`;
        const img = new Image();
        img.onload = () => setPosterReadyUrl(url);
        img.onerror = () => setPosterReadyUrl(null);
        img.src = url;
      } else {
        setPosterReadyUrl(null);
      }

      const video = teampost.teamInfo.demoVideo;
      if (video) {
        const url = `${video}?v=${now}`;
        fetch(url, { method: "HEAD" })
          .then((res) => {
            if (res.ok) setDemoReadyUrl(url);
            else setDemoReadyUrl(null);
          })
          .catch(() => setDemoReadyUrl(null));
      } else {
        setDemoReadyUrl(null);
      }
    }
  }, [teampost, location.search]);

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
          <TeamProfile key={profileImageUrl} src={profileImageUrl} />
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
          {demoReadyUrl ? (
            <TeamVideo key={demoReadyUrl} controls>
              <source src={demoReadyUrl} type="video/mp4" />
            </TeamVideo>
          ) : (
            <></>
            // <EmptyVideoPlaceholder>프로젝트 영상이 업로드되지 않았습니다.</EmptyVideoPlaceholder>
          )}
        </VideoIntro>

        <SectionTitle id="poster">Poster</SectionTitle>
        <PosterIntro>
          {posterReadyUrl ? (
            <PosterImg src={posterReadyUrl} />
          ) : (
            <></>
            // <EmptyVideoPlaceholder>포스터가 업로드되지 않았습니다.</EmptyVideoPlaceholder>
          )}
        </PosterIntro>
      </Container>

      <TableOfContents entries={tocEntries} />
    </>
  );
};

export default TeamPage;

// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useLocation, useNavigate, useParams } from "react-router-dom";

// import { RootState } from "@store/store";
// import { setExhibitionYear } from "@store/reducers/exhibitionYear";
// import { postGetTeampost } from "@api/teamPost";
// import { getProjects } from "@api/team";
// import { useModal } from "@hooks";

// import { IProject, ITeamPost, ITeamStudent } from "@interface";
// import { IprofessorInfo } from "src/interface/ITeamPost";

// import empty from "@assets/image/main_image.png";
// import userEmpty from "@assets/image/user.png";

// import ProfileView from "@components/ProfileView";
// import ProfessorProfileView from "@components/ProfessorProfileView";

// import {
//   Container,
//   SectionTitle,
//   TeamIntro,
//   TeamTitle,
//   TeamProfile,
//   TeamContent,
//   MemberList,
//   StudentItem,
//   ProfessorItem,
//   StudentInfo,
//   StudentName,
//   ProfessorName,
//   StudentBadge,
//   ProfessorBadge,
//   VideoIntro,
//   TeamVideo,
//   EmptyVideoPlaceholder,
//   PosterIntro,
//   PosterImg,
//   EditButton,
//   PrevButton,
//   NextButton,
//   TocWrapper,
//   TocItem,
// } from "./TeamPage.styled";

// interface TocEntry {
//   id: string;
//   label: string;
// }

// export function TableOfContents({ entries }: { entries: TocEntry[] }) {
//   const [activeId, setActiveId] = useState(entries[0]?.id || "");
//   const lockRef = useRef(false);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (lockRef.current) return;
//         const visible = entries
//           .filter((e) => e.isIntersecting)
//           .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
//         if (visible.length > 0) {
//           setActiveId(visible[0].target.id);
//         }
//       },
//       {
//         rootMargin: "-45% 0px -55% 0px",
//         threshold: 0.1,
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
//       lockRef.current = true;
//       el.scrollIntoView({ behavior: "smooth", block: "center" });
//       setActiveId(id);

//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       timeoutRef.current = setTimeout(() => {
//         lockRef.current = false;
//       }, 1500);
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

// const TeamPage: React.FC = () => {
//   const { year, team_uuid } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { openModal, Modal, isOpen } = useModal();
//   const auth = useSelector((state: RootState) => state.auth);
//   const exhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

//   const [teampost, setTeampost] = useState<ITeamPost>();
//   const [selectedStudent, setSelectedStudent] = useState<ITeamStudent | null>(null);
//   const [selectedProfessor, setSelectedProfessor] = useState<IprofessorInfo | null>(null);
//   const [projects, setProjects] = useState<IProject[]>([]);

//   const [profileImageUrl, setProfileImageUrl] = useState<string>(empty);
//   const [posterReadyUrl, setPosterReadyUrl] = useState<string | null>(null);
//   const [demoReadyUrl, setDemoReadyUrl] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isOpen) {
//       setSelectedStudent(null);
//       setSelectedProfessor(null);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (year) {
//       fetchProjects(year);
//       if (!exhibitionYear) dispatch(setExhibitionYear(year));
//     }
//   }, [year, exhibitionYear, dispatch]);

//   useEffect(() => {
//     if (team_uuid) fetchTeampost(team_uuid);
//   }, [team_uuid, location.search]);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   const fetchProjects = async (yearStr: string) => {
//     try {
//       const res = await getProjects(yearStr);
//       setProjects(res.sort((a, b) => a.teamName.localeCompare(b.teamName)));
//     } catch (error) {
//       console.error();
//     }
//   };

//   const fetchTeampost = async (teamId: string) => {
//     try {
//       const res = await postGetTeampost(teamId);
//       setTeampost(res);
//     } catch (error) {
//       console.error();
//     }
//   };

//   useEffect(() => {
//     if (teampost) {
//       const now = Date.now();
//       const profile = teampost.teamInfo.teamProfileImage;
//       setProfileImageUrl(profile ? `${profile}?v=${now}` : empty);

//       const poster = teampost.teamInfo.posterImage;
//       if (poster) {
//         const url = `${poster}?v=${now}`;
//         const img = new Image();
//         img.onload = () => setPosterReadyUrl(url);
//         img.onerror = () => setPosterReadyUrl(null);
//         img.src = url;
//       } else {
//         setPosterReadyUrl(null);
//       }

//       const video = teampost.teamInfo.demoVideo;
//       if (video) {
//         const url = `${video}?v=${now}`;
//         fetch(url, { method: "HEAD" })
//           .then((res) => {
//             if (res.ok) setDemoReadyUrl(url);
//             else setDemoReadyUrl(null);
//           })
//           .catch(() => setDemoReadyUrl(null));
//       } else {
//         setDemoReadyUrl(null);
//       }
//     }
//   }, [teampost, location.search]);

//   const navigateProject = (dir: "prev" | "next") => {
//     if (!teampost || !projects.length) return;
//     const idx = projects.findIndex((p) => p.uuid === team_uuid);
//     if (idx === -1) return;
//     const newIdx = dir === "prev" ? (idx - 1 + projects.length) % projects.length : (idx + 1) % projects.length;
//     navigate(`/${year}/project/${projects[newIdx].uuid}`);
//   };

//   const handleStudentClick = (s: ITeamStudent) => {
//     setSelectedStudent(s);
//     openModal();
//   };

//   const tocEntries: TocEntry[] = [
//     { id: "intro", label: "Team Intro" },
//     { id: "members", label: "Members" },
//     { id: "project-video", label: "Project Video" },
//     { id: "poster", label: "Poster" },
//   ];

//   return (
//     <>
//       {(auth.uuid === team_uuid || auth.role === "ADMIN") && (
//         <EditButton onClick={() => navigate(`${location.pathname}/edit`)}>EDIT</EditButton>
//       )}
//       <PrevButton onClick={() => navigateProject("prev")}>←</PrevButton>
//       <NextButton onClick={() => navigateProject("next")}>→</NextButton>

//       <Container>
//         <TeamIntro id="intro">
//           <TeamTitle>{teampost?.teamInfo.title || "PROJECT TITLE"}</TeamTitle>
//           <TeamProfile key={profileImageUrl} src={profileImageUrl} />
//           <TeamContent>{teampost?.teamInfo.content || "PROJECT DESCRIPTION"}</TeamContent>
//         </TeamIntro>

//         <SectionTitle id="members">Members</SectionTitle>
//         <MemberList>
//           {teampost?.professorInfo.professorName && (
//             <ProfessorItem
//               onClick={() => {
//                 setSelectedProfessor(teampost.professorInfo);
//                 openModal();
//               }}
//             >
//               <StudentInfo src={teampost.professorInfo.professorImage || userEmpty} />
//               <ProfessorName>{teampost.professorInfo.professorName}</ProfessorName>
//               <ProfessorBadge>지도교수</ProfessorBadge>
//             </ProfessorItem>
//           )}
//           {teampost?.students
//             .slice()
//             .sort((a, b) => {
//               if (a.role === "LEADER" && b.role !== "LEADER") return -1;
//               if (a.role !== "LEADER" && b.role === "LEADER") return 1;
//               return a.name.localeCompare(b.name);
//             })
//             .map((s, i) => (
//               <StudentItem key={i} onClick={() => handleStudentClick(s)}>
//                 <StudentInfo src={s.profileImage || userEmpty} />
//                 <StudentName>{s.name}</StudentName>
//                 {s.role === "LEADER" && <StudentBadge>팀장</StudentBadge>}
//               </StudentItem>
//             ))}
//         </MemberList>

//         <Modal>
//           {selectedStudent && <ProfileView student={selectedStudent} />}
//           {selectedProfessor && <ProfessorProfileView professor={selectedProfessor} />}
//         </Modal>

//         <SectionTitle id="project-video">Project Video</SectionTitle>
//         <VideoIntro>
//           {demoReadyUrl ? (
//             <TeamVideo key={demoReadyUrl} controls>
//               <source src={demoReadyUrl} type="video/mp4" />
//             </TeamVideo>
//           ) : (
//             <></>
//             // <EmptyVideoPlaceholder>프로젝트 영상이 업로드되지 않았습니다.</EmptyVideoPlaceholder>
//           )}
//         </VideoIntro>

//         <SectionTitle id="poster">Poster</SectionTitle>
//         <PosterIntro>
//           {posterReadyUrl ? (
//             <PosterImg src={posterReadyUrl} />
//           ) : (
//             <></>
//             // <EmptyVideoPlaceholder>포스터가 업로드되지 않았습니다.</EmptyVideoPlaceholder>
//           )}
//         </PosterIntro>
//       </Container>

//       <TableOfContents entries={tocEntries} />
//     </>
//   );
// };

// export default TeamPage;
