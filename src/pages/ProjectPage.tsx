import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import { getProjects } from "../api/team";
import { IProject } from "../types/IProject";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 5rem;
  padding: 5rem;
`;
const TeamBox = styled.div`
  width: 100%; /* 너비를 부모 요소에 맞게 100%로 설정 */
  padding-bottom: 100%; /* 높이를 너비에 비례하도록 설정 (정사각형 유지) */
  position: relative; /* 내부 요소를 절대 위치로 설정하기 위해 필요 */
  border: 1px solid red;
`;
const TeamImage = styled.img`
  width: 100%;
`;

const ProjectPage = () => {
  const selectedExhibitionYear = useSelector((state: RootState) => state.exhibitionYear);

  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);

  const getProject = async (year: string) => {
    try {
      const res = await getProjects(year);
      setProjects(res);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    if (selectedExhibitionYear) {
      getProject(selectedExhibitionYear);
    }
  }, [selectedExhibitionYear]);

  return (
    <Container>
      {projects.map((pro) => {
        return (
          <TeamBox key={pro.encryptedTeamId} onClick={() => navigate(`/${selectedExhibitionYear}/project/${pro.encryptedTeamId}`)}>
            <TeamImage src={`data:image/jpeg;base64,${pro.teamProfileImg}`} />
            {pro.encryptedTeamId}-{pro.category}-{pro.teamName}-{pro.teamProfileImg}
          </TeamBox>
        );
      })}
    </Container>
  );
};

export default ProjectPage;
