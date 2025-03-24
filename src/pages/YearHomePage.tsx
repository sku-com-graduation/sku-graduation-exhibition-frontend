// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import { motion, Variants, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
// import RipplingCircle from "@components/RipplingCircle";

// import img1 from "../assets/image/img1.png";
// import { useParams } from "react-router-dom";
// import { getTeamProflies } from "@src/api/team";

// // ======================== STYLES ========================
// const Overlay = styled(motion.div)`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100vw;
//   height: 100vh;
//   z-index: 9999;
//   pointer-events: none;
// `;

// const MaskedDiv = styled(motion.div)`
//   width: 100%;
//   height: 100%;
//   background: radial-gradient(
//     circle at 18% 42%,
//     transparent var(--hole-size),
//     rgba(223, 223, 223, 0.8) calc(var(--hole-size) + 1%),
//     #b5b5b5 calc(var(--hole-size) + 10%)
//   );
// `;

// // ======================== COMPONENTS ========================
// const BlackHoleImage = () => {
//   const { scrollY } = useScroll();
//   const [permanentlyGone, setPermanentlyGone] = useState(false);

//   const rawHoleSize = useTransform(scrollY, [0, 10], ["15%", "130%"]);
//   const rawScale = useTransform(scrollY, [0, 10], [1, 1.5]);
//   const rawOpacity = useTransform(scrollY, [2, 10], [1, 0]);

//   const holeSize = useSpring(rawHoleSize, { stiffness: 60, damping: 20 });
//   const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });
//   const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 30 });

//   useMotionValueEvent(opacity, "change", (latest) => {
//     if (latest <= 0 && !permanentlyGone) {
//       setPermanentlyGone(true);
//     }
//   });

//   if (permanentlyGone) return null;

//   return (
//     <Overlay style={{ scale, opacity }}>
//       <MaskedDiv style={{ "--hole-size": holeSize } as React.CSSProperties} />
//     </Overlay>
//   );
// };

// const Container = styled.div`
//   color: #222;
//   background: #f9f9f9;
//   min-height: 100vh;
//   position: relative;
//   overflow-x: hidden;
//   font-family: "Helvetica Neue", sans-serif;
// `;

// // const Header = styled.header`
// //   display: flex;
// //   justify-content: space-between;
// //   align-items: center;
// //   padding: 24px 40px;
// //   z-index: 100;
// //   position: relative;
// // `;

// const Logo = styled.h1`
//   font-size: 1.2rem;
//   letter-spacing: 1px;
//   font-weight: 600;
//   color: #333;
// `;

// const HeaderMenu = styled.nav`
//   a {
//     margin-left: 30px;
//     text-decoration: none;
//     color: #444;
//     font-weight: 500;
//     transition: all 0.3s ease;

//     &:hover {
//       color: #000;
//     }
//   }
// `;

// const LeftVerticalMenu = styled.aside`
//   position: fixed;
//   left: 1.5%;
//   top: 50%;
//   transform: translateY(-50%);
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   z-index: 10;
// `;

// const VerticalText = styled.div`
//   writing-mode: vertical-rl;
//   transform: rotate(180deg);
//   text-align: center;
//   font-size: 12px;
//   color: #555;
//   margin: 14px 0;
//   letter-spacing: 1px;

//   span {
//     display: block;
//     margin-bottom: 10px;
//   }
// `;

// const MainSection = styled.main`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 60px;
//   width: 80%;
//   margin: 120px auto;
//   text-align: left;
//   padding: 20px 0;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     gap: 40px;
//   }
// `;

// const MainTitle = styled(motion.h1)`
//   font-size: 3.6rem;
//   font-weight: 700;
//   color: #585858;
//   letter-spacing: 0.02em;
//   line-height: 1.15;
//   text-transform: uppercase;
//   margin: 1rem;

//   @media (max-width: 768px) {
//     font-size: 2.8rem;
//   }
// `;

// const ImageContainer = styled.div`
//   position: relative;
//   display: inline-block;

//   img {
//     max-width: 420px;
//     width: 100%;
//     display: block;
//     /* border-radius: 12px;
//     box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); */
//   }
// `;

// const BottomInfo = styled.footer`
//   position: fixed;
//   bottom: 20px;
//   right: 30px;
//   text-align: right;
//   padding: 14px 18px;
//   border-radius: 6px;
//   backdrop-filter: blur(4px);
//   background-color: rgba(255, 255, 255, 0.7);
//   box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.05);
// `;

// const DateTime = styled.div`
//   margin-bottom: 6px;
//   font-size: 0.85rem;
//   color: #666;
// `;

// const containerVariants: Variants = {
//   hidden: {},
//   visible: {
//     transition: {
//       staggerChildren: 0.4,
//     },
//   },
// };

// const textVariants: Variants = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0 },
// };

// // ======================== MAIN UI ========================

// // 슬라이더 관련 스타일
// const SliderWrapper = styled.div`
//   overflow: hidden;
//   width: 100%;
//   margin: 3rem 0;
// `;

// const SliderRow = styled(motion.div)`
//   display: flex;
//   gap: 1rem;
// `;

// const SliderImage = styled(motion.img)`
//   width: 200px;
//   height: 200px;
//   object-fit: cover;
//   flex-shrink: 0;
//   border-radius: 10px;
//   box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

//   @media (max-width: 768px) {
//     width: 100px;
//     height: 100px;
//   }
// `;

// const fetchTeamProfile = async (year: string) => {
//   try {
//     const res: string[] = await getTeamProflies(year);
//     return res;
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//   }
// };

// const ImageSlider = () => {
//   const { year } = useParams();
//   const [sliderImages, setSliderImages] = useState<string[]>([]);

//   useEffect(() => {
//     async function loadImages() {
//       const images = await fetchTeamProfile(year || "");
//       if (images) {
//         setSliderImages(images);
//       }
//     }
//     loadImages();
//   }, [year]);

//   const sliderTransition = { duration: 20, ease: "linear", repeat: Infinity };

//   return (
//     <>
//       <SliderWrapper>
//         <SliderRow animate={{ x: ["0%", "-50%"] }} transition={sliderTransition}>
//           {sliderImages.map((src, index) => (
//             <SliderImage key={`row1-${index}`} src={`data:image/jpeg;base64,${src}`} alt={`slider-${index}`} />
//           ))}
//         </SliderRow>
//       </SliderWrapper>
//       <SliderWrapper>
//         <SliderRow animate={{ x: ["0%", "50%"] }} transition={sliderTransition}>
//           {sliderImages.map((src, index) => (
//             <SliderImage key={`row2-${index}`} src={`data:image/jpeg;base64,${src}`} alt={`slider-${index}`} />
//           ))}
//         </SliderRow>
//       </SliderWrapper>
//     </>
//   );
// };

// const YearHomePage: React.FC = () => {
//   return (
//     <>
//       <BlackHoleImage />
//       <Container>
//         <LeftVerticalMenu>
//           <VerticalText>
//             <span>SUNKYUL UNIVERSITY</span>
//           </VerticalText>
//           <VerticalText>
//             <span>COMPUTER ENGINEERING</span>
//           </VerticalText>
//         </LeftVerticalMenu>

//         <MainSection>
//           <motion.div variants={containerVariants} initial="hidden" animate="visible">
//             <MainTitle variants={textVariants}>WHERE</MainTitle>
//             <MainTitle variants={textVariants}>IDEAS</MainTitle>
//             <MainTitle variants={textVariants}>BECOME</MainTitle>
//             <MainTitle variants={textVariants}>REALITY</MainTitle>
//           </motion.div>

//           <ImageContainer>
//             <img src={img1} />
//             {/* <RipplingCircle /> */}
//           </ImageContainer>
//         </MainSection>

//         <BottomInfo>
//           <DateTime>
//             2025.11.07
//             <br />
//             09:00 - 18:00
//           </DateTime>
//         </BottomInfo>

//         <div style={{ height: "300vh" }}>
//           <ImageSlider />
//         </div>
//       </Container>
//     </>
//   );
// };

// export default YearHomePage;

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useViewportScroll, useTransform } from "framer-motion";

import cloud from "../assets/image/t1.gif";
import slider1 from "../assets/image/t1.gif";
import slider2 from "../assets/image/t2.gif";

import study2 from "../assets/image/study2.jpg";
import test from "../assets/image/test.mp4";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamProflies } from "@src/api/team";

const GridContainer = styled(motion.div)`
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  min-height: 100vh;
  padding: 0rem 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem 2rem;
    gap: 1rem;
  }
`;

const TextContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 10rem;
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

const TitleWord = styled(motion.h1)`
  font-size: 6rem;
  margin: 0;
  text-align: left;
  font-family: "Montserrat", sans-serif;
  background: linear-gradient(90deg, #c2ff99, #85f3ff, #7fbfff, #a389f4);
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

const ImageContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10rem;
`;

const CircularImage = styled(motion.img)`
  width: 28rem;
  height: 28rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
  border: 5px solid rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    width: 14rem;
    height: 14rem;
  }
`;

const DateContainer = styled(motion.div)`
  display: grid;
  grid-template-rows: auto auto 1fr 1fr;
  font-size: 1.5rem;
  color: #666666;
  font-family: "Roboto", sans-serif;
  line-height: 1.5;

  & > *:nth-child(1) {
    justify-self: center;
    text-align: center;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  & > *:nth-child(2) {
    justify-self: start;
    text-align: left;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  & > *:nth-child(3) {
    justify-self: start;
    align-self: center;
    margin-bottom: 1rem;
  }

  & > *:nth-child(4) {
    justify-self: end;
    text-align: right;
    font-weight: 300;
    align-self: end;
    margin-bottom: 10rem;
  }

  @media (max-width: 768px) {
    align-items: center;
    font-size: 1rem;
    & > * {
      justify-self: center;
      text-align: center;
      margin-bottom: 0.5rem;
    }
  }
`;

const ScrollTextContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4rem 2rem;

  @media (max-width: 768px) {
    margin: 2rem 1rem;
  }
`;

const ScrollText = styled(motion.h2)`
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

// 슬라이더 관련 스타일
const SliderWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  margin: 3rem 0;
`;

const SliderRow = styled(motion.div)`
  display: flex;
  gap: 1rem;
`;

const SliderImage = styled(motion.img)`
  width: 200px;
  height: 200px;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const FullWidthVideo = styled(motion.video)`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;

  @media (max-width: 768px) {
    margin: 2rem 1rem;
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
  font-size: 2.8rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

// Modern Intro Text (단색 디자인)
const ModernIntroText = styled(motion.p)`
  position: relative;
  font-size: 1.6rem;
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

const CTAButton = styled(motion.button)`
  display: block;
  margin: 4rem auto;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #68aeff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #005bb5;
    transform: translateY(-3px);
  }
`;

const fetchTeamProfile = async (year: string) => {
  try {
    const res: string[] = await getTeamProflies(year);
    return res;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const ImageSlider = () => {
  const { year } = useParams();
  const [sliderImages, setSliderImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadImages() {
      const images = await fetchTeamProfile(year || "");
      if (images) {
        setSliderImages(images);
      }
    }
    loadImages();
  }, [year]);

  const sliderTransition = { duration: 20, ease: "linear", repeat: Infinity };

  if (sliderImages.length === 0) {
    setSliderImages([slider1, slider2]);
  }

  return (
    <>
      <SliderWrapper>
        <SliderRow animate={{ x: ["0%", "-50%"] }} transition={sliderTransition}>
          {sliderImages.map((src, index) => (
            <SliderImage key={`row1-${index}`} src={`data:image/jpeg;base64,${src}`} alt={`slider-${index}`} />
          ))}
        </SliderRow>
      </SliderWrapper>
      <SliderWrapper>
        <SliderRow animate={{ x: ["0%", "50%"] }} transition={sliderTransition}>
          {sliderImages.map((src, index) => (
            <SliderImage key={`row2-${index}`} src={`data:image/jpeg;base64,${src}`} alt={`slider-${index}`} />
          ))}
        </SliderRow>
      </SliderWrapper>
    </>
  );
};

const scrollTextVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const YearHomePage = () => {
  const navigate = useNavigate();
  const { year } = useParams();

  const { scrollY } = useViewportScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const opacityValue = useTransform(scrollY, [0, 300], [1, 0.85]);

  const titleWords = ["WHERE", "IDEAS", "BECOME", "REALITY"];

  return (
    <>
      <GridContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <TextContainer>
          {titleWords.map((word, idx) => (
            <TitleWord
              key={word}
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
            >
              {word}
            </TitleWord>
          ))}
        </TextContainer>

        <ImageContainer>
          <CircularImage
            src={cloud}
            alt="Exhibition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 3, transition: { duration: 0.3 } }}
          />
        </ImageContainer>

        <DateContainer
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div>2025 GRADUATION EXHIBITION</div>
          <div>
            <div>SUNGKYUL</div>
            <div>COMPUTER</div>
            <div>ENGINEERING</div>
          </div>
          <h1>______________ACADEMIC INFORMATION CENTER</h1>
          <div>
            <div>2025.11.07</div>
            <div>09:00 - 18:00</div>
          </div>
        </DateContainer>
      </GridContainer>
      <ScrollTextContainer>
        <motion.div style={{ scale, opacity: opacityValue }}>
          <ScrollText
            variants={scrollTextVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1 }}
            viewport={{ amount: 0.5 }}
          >
            PROJECTS
          </ScrollText>
        </motion.div>
      </ScrollTextContainer>
      <ImageSlider />
      <ModernIntroSection />
      <FullWidthVideo
        src={test}
        autoPlay
        loop
        muted
        playsInline
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 1.2, delay: 2 }}
      />
      <CTAButton
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 2.5 }}
        onClick={() => navigate(`/${year}/project`)}
      >
        VIEW PROJECTS
      </CTAButton>
    </>
  );
};

export default YearHomePage;
