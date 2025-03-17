import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  padding: 5rem;
  box-sizing: border-box;
  background: linear-gradient(135deg, #a7c7ff, #b0bec5);
`;

const Container = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  align-items: center;
  gap: 2rem;
`;

const MainPage = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [currentYear, currentYear - 1, currentYear - 2];
    setYears(yearList);
  }, []);

  return (
    <Wrapper>
      <Container>
        {years.map((year) => (
          <button
            style={{ width: "10rem", height: "10rem", borderRadius: "10rem" }}
            key={year}
            onClick={() => navigate(`/${year}`)}
          >
            {year}
          </button>
        ))}
      </Container>
    </Wrapper>
  );
};

export default MainPage;
