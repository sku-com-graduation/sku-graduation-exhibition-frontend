// import styled from "styled-components";
// import v4 from "../assets/video/v1.mp4";
// import mainImg from "../assets/image/main.jpg";

// import BlackHoleImage from "@components/BlackHoleImage";
// import Header from "@components/Header";

// import { motion } from "framer-motion";

// const Container = styled.div`
//   width: 100%;
//   min-height: 100vh;
//   /* background-color: #ffffff; */

//   background-color: #f6f8f7;
//   position: relative;
//   overflow-x: hidden;
// `;

// const Content = styled.div`
//   width: 100%;
//   min-height: 100vh;
//   display: flex;
//   position: relative;
//   z-index: 1;
// `;

// const LeftTextArea = styled.div`
//   flex: 1;
//   position: relative;
// `;

// const CenterWrapper = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

// const CenterImage = styled.img`
//   max-height: 50rem;
//   object-fit: contain;
// `;

// const RightTextArea = styled.div`
//   flex: 1;
//   display: grid;
//   place-content: center; // 수직 수평 가운데 정렬
//   grid-template-rows: auto auto auto auto;
//   row-gap: 3rem;
//   padding: 2rem;
//   font-size: 2rem;
//   font-weight: 500;
//   /* line-height: 1.5; */
//   color: "#a5a5a5";

//   & > *:nth-child(1) {
//     text-align: center;
//     font-weight: 700;
//   }

//   & > *:nth-child(2) {
//     text-align: left;
//     font-weight: 500;
//   }

//   & > *:nth-child(3) {
//     text-align: left;
//     font-weight: 600;
//   }

//   & > *:nth-child(4) {
//     text-align: right;
//     font-weight: 300;
//   }

//   @media (max-width: 768px) {
//     font-size: 1rem;
//     row-gap: 1rem;

//     & > * {
//       text-align: center;
//     }
//   }
// `;

// // const RightTextArea = styled.div`
// //   flex: 1;
// //   display: flex;
// //   align-items: center;
// //   justify-content: center;
// //   padding: 2rem;
// //   color: #222;
// //   font-size: 1.5rem;
// //   font-weight: 500;
// // `;

// const Video = styled.video`
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   object-position: top;

//   mask-image: url(#text-mask);
//   mask-size: contain;
//   mask-repeat: no-repeat;
//   mask-position: center;

//   -webkit-mask-image: url(#text-mask);
//   -webkit-mask-size: contain;
//   -webkit-mask-repeat: no-repeat;
//   -webkit-mask-position: center;
// `;

// const SVGMask = styled.svg`
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   z-index: 2;
// `;

// function MainUI() {
//   return (
//     <>
//       <Container>
//         <BlackHoleImage />
//         <Header />
//         <Content>
//           {/* 왼쪽: 마스크 + 텍스트 */}
//           <LeftTextArea>
//             <SVGMask>
//               <defs>
//                 <mask id="text-mask" x="0" y="0" width="100%" height="100%">
//                   <rect width="100%" height="100%" fill="black" />
//                   {["WHERE", "IDEAS", "BECOME", "REALITY"].map((word, i) => (
//                     <motion.text
//                       key={i}
//                       x="50%"
//                       y={`${35 + i * 10}%`}
//                       dominantBaseline="middle"
//                       textAnchor="middle"
//                       fontSize="80"
//                       fontWeight="bold"
//                       fill="white"
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: i * 0.5, duration: 0.6, ease: "easeOut" }}
//                     >
//                       {word}
//                     </motion.text>
//                   ))}
//                 </mask>
//               </defs>
//             </SVGMask>

//             <Video autoPlay muted loop playsInline src={v4} />
//           </LeftTextArea>

//           {/* 가운데: 메인 이미지 */}
//           <CenterWrapper>
//             <CenterImage src={mainImg} />
//           </CenterWrapper>
//           {/* 오른쪽: 추가 텍스트 */}
//           <RightTextArea>
//             <div style={{ color: "#454545" }}>2025 GRADUATION EXHIBITION</div>
//             <div style={{ color: "#454545" }}>
//               <div>SUNGKYUL</div>
//               <div>COMPUTER</div>
//               <div>ENGINEERING</div>
//             </div>
//             <div>
//               <h1 style={{ color: "#454545" }}>ACADEMIC</h1>
//               <h1 style={{ color: "#454545" }}>INFORMATION</h1>
//               <h1 style={{ color: "#454545" }}>CENTER</h1>
//             </div>
//             <div>
//               <div style={{ color: "#454545" }}>2025.11.07</div>
//               <div style={{ color: "#454545" }}>09:00 - 18:00</div>
//             </div>
//           </RightTextArea>
//           {/* <RightTextArea>
//             <div>
//               <h2>JOIN THE EXPERIENCE</h2>
//               <p>Explore a world where imagination meets execution.</p>
//             </div>
//           </RightTextArea> */}
//         </Content>
//       </Container>
//       <div style={{ height: "500vh" }} />
//     </>
//   );
// }

// export default MainUI;

// // 2
// import Header from "@components/Header";
// import { motion, useScroll, Variants } from "framer-motion";
// import styled, { keyframes } from "styled-components";

// import img2 from "../assets/image/img2.jpg";
// import SlideImage from "@components/SlideImage";

// import study2 from "../assets/image/study2.jpg";

// const Wrapper = styled(motion.div)`
//   width: 100%;
//   height: auto;
// `;

// const Container = styled.div`
//   width: 100%;
//   min-height: 100vh;
//   background-color: #f6f8f7;
//   position: relative;
//   box-sizing: border-box;
// `;

// const CircularImageWrapper = styled.div`
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   box-sizing: border-box;
// `;

// const CircularImage = styled(motion.img)`
//   width: 40rem;
//   height: 40rem;
//   border-radius: 50%;
//   object-fit: cover;
//   box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
//   border: 0px solid rgba(255, 255, 255, 0.8);

//   @media (max-width: 768px) {
//     width: 14rem;
//     height: 14rem;
//   }
// `;

// const waveAnimation = keyframes`
//   0% {
//     background-position: 10% 20%;
//   }
//   20% {
//     background-position: 80% 30%;
//   }
//   40% {
//     background-position: 40% 90%;
//   }
//   60% {
//     background-position: 90% 10%;
//   }
//   80% {
//     background-position: 30% 80%;
//   }
//   100% {
//     background-position: 10% 20%;
//   }
// `;

// const Ment = styled(motion.div)`
//   position: absolute;
//   top: 60%;
//   right: 40%;
//   transform: translate(50%, -50%);
//   font-size: 5rem;
//   margin: 0;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;

//   color: #161616;
//   animation: ${waveAnimation} 10s ease-in-out infinite;

//   @media (max-width: 768px) {
//     font-size: 2.2rem;
//     right: 50%;
//     top: calc(60% + 5rem);
//     transform: translate(50%, -50%);
//   }
// `;

// const titleWords = ["Experience Innovation.", "Witness Imagination."];

// const ScrollText = styled(motion.h2)`
//   font-size: 2.5rem;
//   font-weight: 600;
//   color: #444444;
//   letter-spacing: 0.3rem;

//   @media (max-width: 768px) {
//     font-size: 1.5rem;
//     letter-spacing: 0.1rem;
//   }
// `;

// // Modern Intro Container (오른쪽 정렬, 고정 배경 이미지)
// const ModernIntroContainer = styled(motion.div)`
//   position: relative;
//   margin: 2rem 0;
//   margin-left: auto;
//   padding: 4rem 3rem;
//   background: url(${study2}) no-repeat center center;
//   background-size: cover;
//   background-attachment: fixed;
//   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
//   overflow: hidden;
//   text-align: left;
//   transition: transform 0.3s ease, box-shadow 0.3s ease;

//   &::before {
//     content: "";
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.5); /* 어두운 오버레이 */
//     z-index: 1;
//   }

//   & > * {
//     position: relative;
//     z-index: 2;
//   }

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
//   }

//   @media (max-width: 768px) {
//     margin: 1rem;
//     padding: 2rem;
//   }
// `;

// // Modern Intro Title (단색 디자인)
// const ModernIntroTitle = styled(motion.h2)`
//   position: relative;
//   font-size: 2.5rem;
//   color: #ffffff;
//   margin-bottom: 1.5rem;
//   font-weight: 700;
// `;

// // Modern Intro Text (단색 디자인)
// const ModernIntroText = styled(motion.p)`
//   position: relative;
//   font-size: 1.5rem;
//   color: #ffffff;
//   line-height: 1.8;
//   margin: 0;
//   max-width: 50rem;
//   align-self: end;

//   @media (max-width: 768px) {
//     font-size: 1.4rem;
//   }
// `;

// const ModernIntroSection = () => {
//   return (
//     <ModernIntroContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }}>
//       <ModernIntroTitle initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.3 }}>
//         성결대학교 컴퓨터공학과 졸업 작품 전시회에 오신 것을 환영합니다.
//       </ModernIntroTitle>
//       <ModernIntroText initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 1.5 }}>
//         본 전시는 우리 학과 학생들이 지난 4년간 학문적 연구와 창의적 도전의 결실로 탄생한 다양한 작품들을 한자리에서 만나실 수 있는 기회를 제공합니다.
//         <br />
//         각 작품은 학생들의 끊임없는 열정과 노력, 그리고 미래에 대한 꿈과 희망이 담겨 있으며, 이를 통해 혁신적인 아이디어와 기술 발전의 현장을 경험하실
//         수 있습니다.
//         <br />
//         전시회를 통해 여러분께서도 우리 학생들의 독창성과 열정에 깊은 감동을 받으시길 바라며, 새로운 영감과 도전을 얻으시길 기대합니다.
//         <br />
//         이번 전시는 단순한 작품 전시를 넘어, 창의적인 사고와 기술 혁신의 장을 마련하고, 차세대 IT 인재들이 꿈을 실현할 수 있는 발판을 제공하는 의미
//         있는 자리입니다.
//         <br />
//         여러분의 많은 관심과 성원 속에, 뜻깊은 전시회가 되기를 진심으로 기원합니다.
//       </ModernIntroText>
//     </ModernIntroContainer>
//   );
// };

// const MainUI2 = () => {
//   return (
//     <Wrapper>
//       <Container>
//         <Header />
//         <CircularImageWrapper>
//           <CircularImage
//             src={img2}
//             initial={{ y: 100, opacity: 0 }}
//             whileInView={{ y: 0, opacity: 1 }}
//             animate={{
//               y: [0, -10, 0, 10, 0],
//             }}
//             transition={{
//               duration: 1,
//             }}
//             whileHover={{ scale: 1.05, rotate: 3, transition: { duration: 0.3 } }}
//           />
//           {titleWords.map((word, idx) => (
//             <Ment
//               key={word}
//               initial={{ y: 100, opacity: 0 }}
//               whileInView={{ y: 0, opacity: 1 }}
//               viewport={{ once: true, amount: 0.5 }}
//               transition={{ duration: 0.6, delay: 0.3 + idx * 0.2 }}
//               style={{ marginTop: `${idx * 5}rem` }}
//             >
//               {word}
//             </Ment>
//           ))}
//         </CircularImageWrapper>
//       </Container>
//       <motion.div style={{ height: "auto", textAlign: "center" }}>
//         <ScrollText
//           initial={{ y: 50, opacity: 0 }}
//           whileInView={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           viewport={{ once: true, amount: 0.5 }}
//         >
//           PROJECTS
//         </ScrollText>
//         <SlideImage year="2025" />
//       </motion.div>
//       <motion.div style={{ height: "auto", textAlign: "center" }}>
//         <ModernIntroSection />
//       </motion.div>
//     </Wrapper>
//   );
// };

// export default MainUI2;

// // 3
// import { motion, useViewportScroll, useTransform } from "framer-motion";
// import styled from "styled-components";
// import { useEffect, useRef, useState } from "react";
// import v from "../assets/video/v1.mp4";

// const Wrapper = styled.div`
//   width: 100%;
//   height: auto;
//   box-sizing: border-box;
// `;

// const LogoWrapper = styled(motion.div)`
//   width: 100%;
//   height: 100vh;
//   background: #fffefc;
//   position: fixed;
//   top: 0;
//   left: 0;
//   overflow: hidden;
//   z-index: 0;
// `;

// const Logo = styled(motion.div)`
//   mix-blend-mode: color-burn;
//   color: white;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   white-space: nowrap;
//   z-index: 2;
// `;

// const MaskedVideo = styled.video<{ $maskSize: string }>`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   z-index: 0;

//   mask-image: radial-gradient(
//     circle at var(--x, 50%) var(--y, 50%),
//     white ${({ $maskSize }) => $maskSize},
//     transparent calc(${({ $maskSize }) => $maskSize} + 1vw)
//   );
//   -webkit-mask-image: radial-gradient(
//     circle at var(--x, 50%) var(--y, 50%),
//     white ${({ $maskSize }) => $maskSize},
//     transparent calc(${({ $maskSize }) => $maskSize} + 1vw)
//   );

//   mask-repeat: no-repeat;
//   mask-size: 100% 100%;
//   -webkit-mask-repeat: no-repeat;
//   -webkit-mask-size: 100% 100%;
//   transition: mask-image 1s ease-out, -webkit-mask-image 1s ease-out;
//   pointer-events: none;
// `;

// // Content는 margin-top: 100vh를 주어 첫 화면 아래에 위치하고,
// // position 및 z-index를 지정해 LogoWrapper보다 위에 표시되도록 합니다.
// const Content = styled.div`
//   width: 100%;
//   height: 100vh;
//   box-sizing: border-box;
//   background: #f7f7f7;
//   padding: 5rem 2rem;
//   font-size: 2rem;
//   line-height: 1.6;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-top: 100vh;
//   position: relative;
//   z-index: 1;
// `;

// const MainUI3 = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [maskSize, setMaskSize] = useState("15vw");
//   const [expanded, setExpanded] = useState(false);

//   const { scrollY } = useViewportScroll();
//   const yRange = useTransform(scrollY, [0, window.innerHeight], [100, 0]);
//   // 스크롤에 따라 LogoWrapper의 투명도를 1에서 0으로 애니메이션합니다.
//   const videoOpacity = useTransform(scrollY, [0, window.innerHeight], [1, 0]);

//   useEffect(() => {
//     if (expanded) {
//       // 클릭 시 마스크 크기 애니메이션
//       let start = 0;
//       const from = 15;
//       const to = 150;
//       const duration = 2000;

//       const animateSize = (timestamp: number) => {
//         if (!start) start = timestamp;
//         const progress = Math.min((timestamp - start) / duration, 1);
//         const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
//         const current = from + (to - from) * eased;
//         setMaskSize(`${current}vw`);

//         if (progress < 1) requestAnimationFrame(animateSize);
//       };

//       requestAnimationFrame(animateSize);
//       return;
//     }

//     // 초기 마스크 위치 애니메이션
//     const start = Date.now();
//     const duration = 2000;

//     const animateMask = () => {
//       const now = Date.now();
//       const progress = Math.min(1, (now - start) / duration);
//       const eased = 1 - Math.pow(1 - progress, 3);
//       const y = 100 - 50 * eased;

//       if (videoRef.current) {
//         videoRef.current.style.setProperty("--x", "50%");
//         videoRef.current.style.setProperty("--y", `${y}%`);
//       }

//       if (progress < 1) requestAnimationFrame(animateMask);
//     };

//     animateMask();
//   }, [expanded]);

//   return (
//     <Wrapper>
//       <LogoWrapper onClick={() => setExpanded(true)} style={{ opacity: videoOpacity }}>
//         <MaskedVideo ref={videoRef} autoPlay loop muted playsInline $maskSize={maskSize}>
//           <source src={v} type="video/mp4" />
//         </MaskedVideo>
//         <Logo>GRADUATION EXHIBITION</Logo>
//       </LogoWrapper>

//       {/* 스크롤에 따라 Content가 아래에서 위로 등장 */}
//       <motion.div style={{ y: yRange }}>
//         <Content>👋 Welcome to the next section! Add anything you want here.</Content>
//       </motion.div>
//     </Wrapper>
//   );
// };

// export default MainUI3;
