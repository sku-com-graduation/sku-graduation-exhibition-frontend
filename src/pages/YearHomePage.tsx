import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { motion, useTransform, useScroll } from "framer-motion";
import SlideImage from "@components/SlideImage";
import i1 from "@assets/image/i3.png";
import v5 from "@assets/video/v1.mp4";
import back from "@assets/image/back_image.png";
import { getHomeInfo } from "@api/home";
import { IHomeResponse } from "@interface";
import { MODERN_INTRO_TEXT, MODERN_INTRO_TITLE } from "@constant/homeText";
import style from "@style";

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${style.color.background};
  padding: 5rem 0 0 0;
  box-sizing: border-box;
  overflow: hidden;
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
  margin: 2rem 2rem;
  box-sizing: border-box;
  overflow-x: hidden;
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
    background: rgba(0, 0, 0, 0.5);
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

const ModernIntroText = styled(motion.p)`
  position: relative;
  font-size: 1.5rem;
  color: #ffffff;
  line-height: 1.8;
  margin: 0;
  max-width: 50rem;
  align-self: end;
  white-space: pre-line;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ModernIntroSection = () => {
  return (
    <ModernIntroContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }}>
      <ModernIntroTitle initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.3 }}>
        {MODERN_INTRO_TITLE}
      </ModernIntroTitle>
      <ModernIntroText initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.5 }}>
        {MODERN_INTRO_TEXT}
      </ModernIntroText>
    </ModernIntroContainer>
  );
};

const YearHomePage = () => {
  const navigate = useNavigate();
  const { year } = useParams();
  const [homeInfo, setHomeInfo] = useState<IHomeResponse>();

  const scrollTextVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const opacityValue = useTransform(scrollY, [0, 300], [1, 0.85]);

  const fetchData = async () => {
    try {
      const homeData = await getHomeInfo(year || "");
      if (homeData) {
        setHomeInfo(homeData);
      } else {
        console.warn("Unexpected home data:", homeData);
      }
    } catch (error) {
      console.error("홈 데이터 로딩 실패", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Wrapper>
      <Container>
        <Title initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          GRADUATION EXHIBITION
        </Title>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
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
          />
        </motion.div>

        <SubInfo initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
          SUNGKYUL COMPUTER ENGINEERING
          <br />
          {homeInfo?.exhibitionDate}
          <br />
          {homeInfo?.exhibitionHour}
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
          <ScrollText variants={scrollTextVariants} initial="hidden" whileInView="visible" transition={{ duration: 1 }} viewport={{ amount: 0.6 }}>
            PROJECTS
          </ScrollText>
        </motion.div>
        <SlideImage year={year || ""} />
      </ScrollTextContainer>

      <ModernIntroSection />
    </Wrapper>
  );
};

export default YearHomePage;
