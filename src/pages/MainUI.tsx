import React from "react";
import styled, { createGlobalStyle } from "styled-components";

import AbstractLogo from "@components/AbstractLogo";
import RipplingCircle from "@components/RipplingCircle";

const GlobalStyle = createGlobalStyle`
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  body {
     color: #4d4d4d;
    line-height: 1.6;
  }
`;

const Container = styled.div`
  color: #5f5f5f;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

/* 상단 영역 */
const TopBar = styled.header`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  background-color: #f8f8f8;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const TopRightMenu = styled.nav`
  a {
    margin-left: 20px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #555;
    }
  }
`;

/* 왼쪽 세로 메뉴 (시맨틱하게 aside 사용) */
const LeftVerticalMenu = styled.aside`
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const VerticalText = styled.div`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
  font-size: 14px;
  margin: 10px 0;

  span {
    display: block;
    margin-bottom: 10px;
  }
`;

/* 메인 컨텐츠 영역 */
const MainSection = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  width: 90%;
  max-width: 1200px;
  margin: 80px auto;
  text-align: left;
  padding: 20px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const MainTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const MainDesc = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 40px;
`;

/* 중앙 이미지 + 텍스트 오버레이 */
const ImageContainer = styled.div`
  position: relative;
  display: inline-block;

  img {
    max-width: 400px;
    width: 100%;
    display: block;
    border-radius: 8px;
  }
`;

const ImageOverlayText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  pointer-events: none;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
`;

/* 하단 영역 */
const BottomInfo = styled.footer`
  position: fixed;
  bottom: 20px;
  right: 20px;
  text-align: right;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const DateTime = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const MoreBtn = styled.button`
  cursor: pointer;
  font-size: 0.9rem;
  background: none;
  border: none;
  text-decoration: underline;
  color: #333;
  padding: 0;

  &:hover {
    color: #555;
  }
`;

const MainUI: React.FC = () => {
  return (
    <>
      <RipplingCircle />

      {/* <GlobalStyle />
      <Container>
        <TopBar>
          <TopRightMenu>
            <a href="#">PROJECT</a>
            <a href="#">LOGIN</a>
          </TopRightMenu>
        </TopBar>

        <LeftVerticalMenu>
          <VerticalText>
            <span>SUNKYUL UNIVERSITY</span>
          </VerticalText>
          <VerticalText>
            <span>COMPUTER ENGINEERING</span>
          </VerticalText>
        </LeftVerticalMenu>

        <MainSection>
          <div>
            <MainTitle>
              WHERE IDEAS
              <br />
              BECOME REALITY
            </MainTitle>
            <MainDesc>
              simply dummy text of the printing and typesetting industry.
              <br />
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </MainDesc>
          </div>
          <ImageContainer>

            <RipplingCircle />
          </ImageContainer>
        </MainSection>

        <BottomInfo>
          <DateTime>
            2025.11.07
            <br />
            09:00-18:00
          </DateTime>
          <MoreBtn>MORE</MoreBtn>
        </BottomInfo>
      </Container> */}
    </>
  );
};

export default MainUI;
