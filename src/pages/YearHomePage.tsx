import { useState } from "react";
import { motion, AnimatePresence, useTransform, useViewportScroll } from "framer-motion";
import styled from "styled-components";
import v5 from "../assets/video/v1.mp4";
import { useNavigate, useParams } from "react-router-dom";
import i1 from "../assets/image/i3.png";
import SlideImage from "@components/SlideImage";
import back from "../assets/image/back_image.png";

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  padding: 5rem 0 0 0;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 80%;
  margin: 0 auto;
  text-align: center;

  background-image: url(${i1});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const VideoCircle = styled(motion.video)`
  width: clamp(14rem, 30vw, 28rem);
  height: clamp(14rem, 30vw, 28rem);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  color: #4b464b;
  line-height: 1.2;
  font-family: "Cinzel", "Times New Roman";
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubInfo = styled(motion.div)`
  font-size: 1.2rem;
  color: #5c5b5b;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  padding: 1rem;
  line-height: 1.6;
  margin: 2rem 0;
`;

const Button = styled(motion.button)`
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #7fbfff, #a389f4);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, #6faeff, #9279f1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ScrollTextContainer = styled(motion.div)`
  width: auto;
  margin: 2rem 5rem;
  box-sizing: border-box;
  overflow-x: hidden; /* 여기에도 추가 */
`;

const ScrollText = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: #444444;
  font-family: "Montserrat", sans-serif;
  letter-spacing: 0.3rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 0.1rem;
  }
`;

const ModernIntroContainer = styled(motion.div)`
  position: relative;
  padding: 4rem 3rem;
  margin-bottom: 5rem;
  background: url(${back}) no-repeat center center;
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
  font-size: 2.8rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
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
    font-size: 1rem;
  }
`;

const ModernIntroSection = () => {
  return (
    <ModernIntroContainer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.2 }}
    >
      <ModernIntroTitle
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        성결대학교 컴퓨터공학과 졸업 작품 전시회에 오신 것을 환영합니다.
      </ModernIntroTitle>
      <ModernIntroText
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        본 전시는 우리 학과 학생들이 지난 4년간 학문적 연구와 창의적 도전의 결실로 탄생한 다양한 작품들을 한자리에서
        만나실 수 있는 기회를 제공합니다.
        <br />
        <br />
        각 작품은 학생들의 끊임없는 열정과 노력, 그리고 미래에 대한 꿈과 희망이 담겨 있으며, 이를 통해 혁신적인
        아이디어와 기술 발전의 현장을 경험하실 수 있습니다.
        <br />
        <br />
        전시회를 통해 여러분께서도 우리 학생들의 독창성과 열정에 깊은 감동을 받으시길 바라며, 새로운 영감과 도전을
        얻으시길 기대합니다.
        <br />
        <br />
        이번 전시는 단순한 작품 전시를 넘어, 창의적인 사고와 기술 혁신의 장을 마련하고, 차세대 IT 인재들이 꿈을 실현할
        수 있는 발판을 제공하는 의미 있는 자리입니다.
        <br />
        <br />
        여러분의 많은 관심과 성원 속에, 뜻깊은 전시회가 되기를 진심으로 기원합니다.
      </ModernIntroText>
    </ModernIntroContainer>
  );
};

const YearHomePage = () => {
  const navigate = useNavigate();
  const { year } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollTextVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const { scrollY } = useViewportScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const opacityValue = useTransform(scrollY, [0, 300], [1, 0.85]);

  return (
    <Wrapper>
      <Container>
        <Title
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          GRADUATION EXHIBITION
        </Title>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <VideoCircle
            src={v5}
            autoPlay
            loop
            muted
            playsInline
            animate={{ y: [0, -10, 0, 10, 0] }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            // whileHover={{ scale: 1.5 }}
            onClick={() => setIsExpanded(true)}
          />
        </motion.div>

        <SubInfo
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          SUNGKYUL COMPUTER ENGINEERING
          <br />
          2025.11.07 (FRI)
          <br />
          09:00 - 18:00
        </SubInfo>

        <Button
          onClick={() => navigate(`/${year}/project`)}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          VIEW PROJECTS
        </Button>
      </Container>

      <ScrollTextContainer>
        <motion.div style={{ scale, opacity: opacityValue }}>
          <ScrollText
            variants={scrollTextVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1 }}
            viewport={{ amount: 0.6 }}
          >
            PROJECTS
          </ScrollText>
        </motion.div>
        <SlideImage year={year || ""} />
      </ScrollTextContainer>

      <ModernIntroSection />

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              cursor: "pointer",
            }}
          >
            <motion.video
              src={v5}
              autoPlay
              loop
              muted
              playsInline
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "1rem",
                boxShadow: "0 0 40px rgba(255,255,255,0.2)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default YearHomePage;
