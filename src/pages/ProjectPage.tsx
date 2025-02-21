import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState, useCallback } from "react";
import { getProjects } from "../api/team";
import { IProject } from "../types/IProject";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import img1 from "../assets/image/img1.jpg";

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
  gap: 5rem;
  padding: 5rem;
`;

const TeamBox = styled.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  border: 0.0625rem solid #d5d5d5;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease-in-out;

  &:hover {
    filter: brightness(30%);
  }
`;

const CategoryContainer = styled.div`
  padding: 0rem 10rem 5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
`;

const CategoryBox = styled.div`
  border-radius: 2rem;
  font-size: 1.5rem;
  padding: 0.5rem;
  background: ${(props) => props.color};
  color: #fff;

  transition: background 0.1s ease-in-out;
  &:hover {
    cursor: pointer;
    background: #5fbcff;
  }
`;

const Title = styled.div`
  padding: 5rem 0rem;
  text-align: center;
  font-size: 3rem;
`;

const TeamName = styled.div`
  position: absolute;
  bottom: -2rem;
  width: 100%;
  text-align: center;
  font-size: 1.2rem;
`;

const ProjectPage = () => {
  const selectedExhibitionYear = useSelector((state: RootState) => state.exhibitionYear);
  const navigate = useNavigate();

  const categorys = ["ALL", "GAME", "MOBILE", "WEB"];

  const [projects, setProjects] = useState<IProject[]>([]);
  const [category, setCategory] = useState<string>(categorys[0]);

  const getProject = async (year: string) => {
    try {
      const res = await getProjects(year);
      setProjects(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedExhibitionYear) {
      getProject(selectedExhibitionYear);
    }
  }, [selectedExhibitionYear]);

  const handleCategoryChange = useCallback((category: string) => {
    setCategory(category);
  }, []);

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((pro) => category === "ALL" || pro.category === category)
    : [];

  return (
    <Wrapper>
      <Title>PROJECT</Title>
      <CategoryContainer>
        {categorys.map((c) => (
          <CategoryBox key={c} onClick={() => handleCategoryChange(c)} color={category === c ? "#5fbcff" : "#b1b1b1"}>
            {c}
          </CategoryBox>
        ))}
      </CategoryContainer>
      <Container>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((pro) => (
            <TeamBox
              key={pro.encryptedTeamId}
              onClick={() => navigate(`/${selectedExhibitionYear}/project/${pro.teamName}`)}
            >
              <TeamImage src={img1} />
              <TeamName>{pro.teamName}</TeamName>
            </TeamBox>
          ))
        ) : (
          <div></div>
        )}
      </Container>
    </Wrapper>
  );
};

export default ProjectPage;
