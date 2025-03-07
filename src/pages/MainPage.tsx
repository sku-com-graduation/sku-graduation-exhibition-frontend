import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  background: #4b61a7;
  border: none;
  border-radius: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0.25rem 0.625rem rgba(216, 109, 109, 0.1);

  &:hover {
    background: #5a6a76;
    transform: translateY(-0.1875rem);
    box-shadow: 0 0.5rem 1.25rem rgba(236, 48, 48, 0.15);
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: translateY(0.125rem);
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
  max-width: 45rem;
  margin: 0 auto;
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(135deg, #a7c7ff, #b0bec5);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 2rem;
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
          <Button key={year} onClick={() => navigate(`/${year}`)}>
            {year}
          </Button>
        ))}
      </Container>
    </Wrapper>
  );
};

export default MainPage;
