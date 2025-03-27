import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

import { START_YEAR } from "../constant/years";

// 그라데이션 애니메이션 키프레임
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 동적 그라데이션 배경 Wrapper
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(270deg, #f0f4ff, #cfd8dc, #a7c7ff);
  background-size: 600% 600%;
  animation: ${gradientAnimation} 15s ease infinite;
`;

// 기존 UI를 보완하는 컨테이너 (버튼 배치)
const Container = styled.div`
  display: flex;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

// 원형 버튼 스타일
const YearButton = styled.button`
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #7aa0ff, #3f7de3);
  color: #ffffff;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(1);
  }
`;

const MainPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => currentYear - i);

  return (
    <Wrapper>
      <Container>
        {years.map((year) => (
          <YearButton key={year} onClick={() => navigate(`/${year}`)}>
            {year}
          </YearButton>
        ))}
      </Container>
    </Wrapper>
  );
};

export default MainPage;
