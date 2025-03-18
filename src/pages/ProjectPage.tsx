import { useEffect, useState, useCallback } from "react";
import { getProjects } from "../api/team";
import { IProject } from "../interface";
import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import empty from "../assets/image/empty.png";
import { categories, CategoryType } from "../constant/categorys";
import { AnimatePresence, motion } from "framer-motion";

// 기존 스타일 컴포넌트들은 그대로 유지

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: auto;
  box-sizing: border-box;
`;

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 5rem;
  padding: 5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 2rem;
    padding: 2rem;
  }
`;

const TeamBox = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  flex-direction: column;
  align-items: center;

  &:hover .overlay {
    opacity: 1;
  }

  @media (max-width: 768px) {
    padding-bottom: 120%;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
`;

const OverlayText = styled.h3`
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 10px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
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
    filter: brightness(50%);
  }
`;

const CategoryContainer = styled.div`
  box-sizing: border-box;
  padding: 0rem 10rem 5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 2rem;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryBox = styled.div<{ color: string }>`
  border-radius: 2rem;
  font-size: 1.5rem;
  padding: 0.5rem;
  background: ${(props) => props.color};
  color: #fff;
  transition: background 0.1s ease-in-out;

  &:hover {
    background: #85b4ff;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Title = styled.div`
  padding: 5rem 0rem;
  text-align: center;
  font-size: 3rem;

  @media (max-width: 768px) {
    font-size: 2rem;
    padding: 2rem 0rem;
  }
`;

const TeamName = styled.div`
  position: absolute;
  bottom: -2rem;
  width: 100%;
  text-align: center;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    bottom: -1rem;
  }
`;

const ProjectPage = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState<IProject[]>([]);
  const [category, setCategory] = useState<CategoryType>(categories[0]);

  const getProject = async (year: string) => {
    try {
      const res: IProject[] = await getProjects(year);
      const sortedProjects = res.sort((a, b) => a.teamName.localeCompare(b.teamName));
      setProjects(sortedProjects);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (year) {
      getProject(year);
    }
  }, [year]);

  const handleCategoryChange = useCallback((category: CategoryType) => {
    setCategory(category);
  }, []);

  // 카테고리별로 필터링
  const filteredProjects = Array.isArray(projects) ? projects.filter((pro) => category === "ALL" || pro.category === category) : [];

  return (
    <Wrapper>
      <Title>PROJECT</Title>
      <CategoryContainer>
        {categories.map((c) => (
          <CategoryBox key={c} onClick={() => handleCategoryChange(c)} color={category === c ? "#85b4ff" : "#b1b1b1"}>
            {c}
          </CategoryBox>
        ))}
      </CategoryContainer>
      <Container>
        <AnimatePresence>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((pro) => (
              <motion.div
                layout
                key={pro.uuid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <TeamBox onClick={() => navigate(`${location.pathname}/${pro.uuid}`)}>
                  <TeamImage src={pro.teamProfileImage ? `data:image/jpeg;base64,${pro.teamProfileImage}` : empty} />
                  <Overlay className="overlay">
                    <OverlayText>{pro.title}</OverlayText>
                  </Overlay>
                  <TeamName>{pro.teamName}</TeamName>
                </TeamBox>
              </motion.div>
            ))
          ) : (
            <></>
          )}
        </AnimatePresence>
      </Container>
    </Wrapper>
  );
};

export default ProjectPage;
