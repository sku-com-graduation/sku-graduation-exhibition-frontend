import { motion } from "framer-motion";
import styled, { keyframes } from "styled-components";
import v5 from "../assets/video/v5.mp4";
import { useNavigate, useParams } from "react-router-dom";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  place-items: center;
  box-sizing: border-box;
`;

const CircularVideo = styled(motion.video)`
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

const Title = styled.h1`
  margin-top: 5rem;
  text-align: center;
  color: #232222;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
  padding: 2rem;
`;

const Department = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: #444;
  line-height: 1.6;
`;

const Divider = styled.div`
  width: 60%;
  height: 1px;
  background-color: #ccc;
`;

const Schedule = styled.div`
  font-size: 1.2rem;
  color: #666;
  line-height: 1.5;
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

const ProjectButton = styled(motion.button)`
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #7fbfff, #a389f4);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #6faeff, #9279f1);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
  }
`;

const titleWords = ["WHERE", "IDEAS", "BECOME", "REALITY"];

const TitleWord = styled(motion.h1)`
  font-size: 6rem;
  margin: 0;
  text-align: center;
  font-family: "Montserrat", sans-serif;
  background: linear-gradient(90deg, #99adff, #85f3ff, #7fbfff, #a389f4);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  animation: ${waveAnimation} 10s ease-in-out infinite;
  transition: background-position 0.5s ease;
  @media (max-width: 768px) {
    font-size: 3rem;
    letter-spacing: 0.2rem;
  }
`;

const YearHomePagev2 = () => {
  const navigate = useNavigate();
  const { year } = useParams();

  return (
    <Wrapper>
      <MainContainer>
        <InfoContainer>
          <Title>GRADUATION EXHIBITION</Title>
          <Department>SUNGKYUL COMPUTER ENGINEERING</Department>
          <Divider />
          <Schedule>
            2025.11.07 FRI
            <br />
            09:00 - 18:00
          </Schedule>
          <ProjectButton onClick={() => navigate(`/${year}/project`)}>VIEW PROJECTS</ProjectButton>
        </InfoContainer>
        <CircularVideo
          src={v5}
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          whileHover={{ scale: 1.05, rotate: 3, transition: { duration: 0.3 } }}
        />
      </MainContainer>
    </Wrapper>
  );
};

export default YearHomePagev2;
