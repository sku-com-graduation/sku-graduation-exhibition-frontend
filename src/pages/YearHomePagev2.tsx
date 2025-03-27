// YearHomePagev2.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import v5 from "../assets/video/v1.mp4";
import { useNavigate, useParams } from "react-router-dom";
import i1 from "../assets/image/i3.png";

// Styled Components
const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;

  background-image: url(${i1});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 3rem;
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

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubInfo = styled(motion.div)`
  font-size: 1.2rem;
  color: #5c5b5b;
  background-color: rgba(204, 185, 255, 0.6);
  border-radius: 1rem;
  padding: 1rem;
  line-height: 1.6;
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

const YearHomePagev2 = () => {
  const navigate = useNavigate();
  const { year } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Wrapper>
      <Container>
        <Title initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          GRADUATION EXHIBITION
        </Title>

        <VideoCircle
          src={v5}
          autoPlay
          loop
          muted
          playsInline
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          onClick={() => setIsExpanded(true)}
        />

        <SubInfo initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}>
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

export default YearHomePagev2;

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import styled, { keyframes } from "styled-components";
// import v5 from "../assets/video/v1.mp4";
// import i1 from "../assets/image/i2.png";
// import { useNavigate, useParams } from "react-router-dom";

// const Wrapper = styled.div`
//   width: 100%;
//   height: auto;
// `;

// const MainContainer = styled(motion.div)`
//   background-image: url(${i1});
//   background-size: contain;
//   background-repeat: no-repeat;
//   background-position: center;
//   height: 100vh;
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   place-items: center;
//   box-sizing: border-box;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const CircularVideo = styled(motion.video)`
//   width: clamp(12rem, 30vw, 40rem);
//   height: clamp(12rem, 30vw, 40rem);
//   border-radius: 50%;
//   object-fit: cover;
//   box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
//   border: 0px solid rgba(255, 255, 255, 0.8);
//   cursor: pointer;
// `;

// const Title = styled.h1`
//   margin-top: 5rem;
//   text-align: center;
//   color: #232222;
// `;

// const InfoContainer = styled(motion.div)`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   gap: 1.5rem;
//   padding: 2rem;
// `;

// const Department = styled.div`
//   font-size: 1.4rem;
//   font-weight: 500;
//   color: #444;
//   line-height: 1.6;
// `;

// const Divider = styled.div`
//   width: 60%;
//   height: 1px;
//   background-color: #ccc;
// `;

// const Schedule = styled.div`
//   font-size: 1.2rem;
//   color: #666;
//   line-height: 1.5;
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

// const ProjectButton = styled(motion.button)`
//   width: 100%;
//   padding: 1rem 2rem;
//   font-size: 1.2rem;
//   font-weight: 600;
//   color: #ffffff;
//   background: linear-gradient(135deg, #7fbfff, #a389f4);
//   border: none;
//   border-radius: 12px;
//   cursor: pointer;
//   box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
//   transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
//     background: linear-gradient(135deg, #6faeff, #9279f1);
//   }

//   &:active {
//     transform: scale(0.98);
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//   }

//   @media (max-width: 768px) {
//     font-size: 1rem;
//     padding: 0.8rem 1.5rem;
//   }
// `;

// const TitleWord = styled(motion.h1)`
//   font-size: 6rem;
//   margin: 0;
//   text-align: center;
//   font-family: "Montserrat", sans-serif;
//   background: linear-gradient(90deg, #99adff, #85f3ff, #7fbfff, #a389f4);
//   background-size: 200%;
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
//   animation: ${waveAnimation} 10s ease-in-out infinite;
//   transition: background-position 0.5s ease;

//   @media (max-width: 768px) {
//     font-size: 3rem;
//     letter-spacing: 0.2rem;
//   }
// `;

// const YearHomePagev2 = () => {
//   const navigate = useNavigate();
//   const { year } = useParams();
//   const [isExpanded, setIsExpanded] = useState(false);

//   return (
//     <Wrapper>
//       <MainContainer initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
//         <InfoContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
//           <Title>GRADUATION EXHIBITION</Title>
//           <Department>SUNGKYUL COMPUTER ENGINEERING</Department>
//           <Divider />
//           <Schedule>
//             2025.11.07 FRI
//             <br />
//             09:00 - 18:00
//           </Schedule>
//           <ProjectButton
//             onClick={() => navigate(`/${year}/project`)}
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//           >
//             VIEW PROJECTS
//           </ProjectButton>
//         </InfoContainer>

//         <CircularVideo
//           src={v5}
//           autoPlay
//           loop
//           muted
//           playsInline
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 60, damping: 15, duration: 0.8 }}
//           onClick={() => setIsExpanded(true)}
//         />
//       </MainContainer>

//       {/* 모달 */}
//       <AnimatePresence>
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setIsExpanded(false)}
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100vw",
//               height: "100vh",
//               backgroundColor: "rgba(0, 0, 0, 0.8)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//               cursor: "pointer",
//             }}
//           >
//             <motion.video
//               src={v5}
//               autoPlay
//               loop
//               muted
//               playsInline
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               style={{
//                 maxWidth: "90vw",
//                 maxHeight: "90vh",
//                 borderRadius: "1rem",
//                 boxShadow: "0 0 40px rgba(255,255,255,0.2)",
//               }}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </Wrapper>
//   );
// };

// export default YearHomePagev2;
