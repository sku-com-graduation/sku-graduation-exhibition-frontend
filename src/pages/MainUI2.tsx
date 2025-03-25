import Header from "@components/Header";
import { motion, useScroll, Variants } from "framer-motion";
import styled, { keyframes } from "styled-components";

import img2 from "../assets/image/img2.jpg";
import SlideImage from "@components/SlideImage";

import study2 from "../assets/image/study2.jpg";

const Wrapper = styled(motion.div)`
  width: 100%;
  height: auto;
`;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f6f8f7;
  position: relative;
  box-sizing: border-box;
`;

const CircularImageWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
`;

const CircularImage = styled(motion.img)`
  width: 40rem;
  height: 40rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  border: 0px solid rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    width: 14rem;
    height: 14rem;
  }
`;

const waveAnimation = keyframes`
  0% {
    background-position: 10% 20%;
  }
  20% {
    background-position: 80% 30%;
  }
  40% {
    background-position: 40% 90%;
  }
  60% {
    background-position: 90% 10%;
  }
  80% {
    background-position: 30% 80%;
  }
  100% {
    background-position: 10% 20%;
  }
`;

const Ment = styled(motion.div)`
  position: absolute;
  top: 60%;
  right: 40%;
  transform: translate(50%, -50%);
  font-size: 5rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  color: #161616;
  animation: ${waveAnimation} 10s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    right: 50%;
    top: calc(60% + 5rem);
    transform: translate(50%, -50%);
  }
`;

const titleWords = ["Experience Innovation.", "Witness Imagination."];

const ScrollText = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 600;
  color: #444444;
  letter-spacing: 0.3rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 0.1rem;
  }
`;

// Modern Intro Container (오른쪽 정렬, 고정 배경 이미지)
const ModernIntroContainer = styled(motion.div)`
  position: relative;
  margin: 2rem 0;
  margin-left: auto;
  padding: 4rem 3rem;
  background: url(${study2}) no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* 어두운 오버레이 */
    z-index: 1;
  }

  & > * {
    position: relative;
    z-index: 2;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 2rem;
  }
`;

// Modern Intro Title (단색 디자인)
const ModernIntroTitle = styled(motion.h2)`
  position: relative;
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

// Modern Intro Text (단색 디자인)
const ModernIntroText = styled(motion.p)`
  position: relative;
  font-size: 1.5rem;
  color: #ffffff;
  line-height: 1.8;
  margin: 0;
  max-width: 50rem;
  align-self: end;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ModernIntroSection = () => {
  return (
    <ModernIntroContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }}>
      <ModernIntroTitle initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.3 }}>
        성결대학교 컴퓨터공학과 졸업 작품 전시회에 오신 것을 환영합니다.
      </ModernIntroTitle>
      <ModernIntroText initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.5 }}>
        본 전시는 우리 학과 학생들이 지난 4년간 학문적 연구와 창의적 도전의 결실로 탄생한 다양한 작품들을 한자리에서 만나실 수 있는 기회를 제공합니다.
        <br />
        각 작품은 학생들의 끊임없는 열정과 노력, 그리고 미래에 대한 꿈과 희망이 담겨 있으며, 이를 통해 혁신적인 아이디어와 기술 발전의 현장을 경험하실
        수 있습니다.
        <br />
        전시회를 통해 여러분께서도 우리 학생들의 독창성과 열정에 깊은 감동을 받으시길 바라며, 새로운 영감과 도전을 얻으시길 기대합니다.
        <br />
        이번 전시는 단순한 작품 전시를 넘어, 창의적인 사고와 기술 혁신의 장을 마련하고, 차세대 IT 인재들이 꿈을 실현할 수 있는 발판을 제공하는 의미
        있는 자리입니다.
        <br />
        여러분의 많은 관심과 성원 속에, 뜻깊은 전시회가 되기를 진심으로 기원합니다.
      </ModernIntroText>
    </ModernIntroContainer>
  );
};

const MainUI2 = () => {
  return (
    <Wrapper>
      <Container>
        <Header />
        <CircularImageWrapper>
          <CircularImage
            src={img2}
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            animate={{
              y: [0, -10, 0, 10, 0],
            }}
            transition={{
              duration: 1,
            }}
            whileHover={{ scale: 1.05, rotate: 3, transition: { duration: 0.3 } }}
          />
          {titleWords.map((word, idx) => (
            <Ment
              key={word}
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.2 }}
              style={{ marginTop: `${idx * 5}rem` }}
            >
              {word}
            </Ment>
          ))}
        </CircularImageWrapper>
      </Container>
      <motion.div style={{ height: "auto", textAlign: "center" }}>
        <ScrollText
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          PROJECTS
        </ScrollText>
        <SlideImage year="2025" />
      </motion.div>
      <motion.div style={{ height: "auto", textAlign: "center" }}>
        <ModernIntroSection />
      </motion.div>
    </Wrapper>
  );
};

export default MainUI2;
