import styled from "styled-components";
import v4 from "../assets/video/v1.mp4";
import mainImg from "../assets/image/main.jpg";

import BlackHoleImage from "@components/BlackHoleImage";
import Header from "@components/Header";

import { motion } from "framer-motion";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  /* background-color: #ffffff; */

  background-color: #f6f8f7;
  position: relative;
  overflow-x: hidden;
`;

const Content = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  position: relative;
  z-index: 1;
`;

const LeftTextArea = styled.div`
  flex: 1;
  position: relative;
`;

const CenterWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterImage = styled.img`
  max-height: 50rem;
  object-fit: contain;
`;

const RightTextArea = styled.div`
  flex: 1;
  display: grid;
  place-content: center; // 수직 수평 가운데 정렬
  grid-template-rows: auto auto auto auto;
  row-gap: 3rem;
  padding: 2rem;
  font-size: 2rem;
  font-weight: 500;
  /* line-height: 1.5; */
  color: "#a5a5a5";

  & > *:nth-child(1) {
    text-align: center;
    font-weight: 700;
  }

  & > *:nth-child(2) {
    text-align: left;
    font-weight: 500;
  }

  & > *:nth-child(3) {
    text-align: left;
    font-weight: 600;
  }

  & > *:nth-child(4) {
    text-align: right;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    row-gap: 1rem;

    & > * {
      text-align: center;
    }
  }
`;

// const RightTextArea = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 2rem;
//   color: #222;
//   font-size: 1.5rem;
//   font-weight: 500;
// `;

const Video = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;

  mask-image: url(#text-mask);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;

  -webkit-mask-image: url(#text-mask);
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
`;

const SVGMask = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

function MainUI() {
  return (
    <>
      <Container>
        <BlackHoleImage />
        <Header />
        <Content>
          {/* 왼쪽: 마스크 + 텍스트 */}
          <LeftTextArea>
            <SVGMask>
              <defs>
                <mask id="text-mask" x="0" y="0" width="100%" height="100%">
                  <rect width="100%" height="100%" fill="black" />
                  {["WHERE", "IDEAS", "BECOME", "REALITY"].map((word, i) => (
                    <motion.text
                      key={i}
                      x="50%"
                      y={`${35 + i * 10}%`}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="80"
                      fontWeight="bold"
                      fill="white"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.5, duration: 0.6, ease: "easeOut" }}
                    >
                      {word}
                    </motion.text>
                  ))}
                </mask>
              </defs>
            </SVGMask>

            <Video autoPlay muted loop playsInline src={v4} />
          </LeftTextArea>

          {/* 가운데: 메인 이미지 */}
          <CenterWrapper>
            <CenterImage src={mainImg} />
          </CenterWrapper>
          {/* 오른쪽: 추가 텍스트 */}
          <RightTextArea>
            <div style={{ color: "#454545" }}>2025 GRADUATION EXHIBITION</div>
            <div style={{ color: "#454545" }}>
              <div>SUNGKYUL</div>
              <div>COMPUTER</div>
              <div>ENGINEERING</div>
            </div>
            <div>
              <h1 style={{ color: "#454545" }}>ACADEMIC</h1>
              <h1 style={{ color: "#454545" }}>INFORMATION</h1>
              <h1 style={{ color: "#454545" }}>CENTER</h1>
            </div>
            <div>
              <div style={{ color: "#454545" }}>2025.11.07</div>
              <div style={{ color: "#454545" }}>09:00 - 18:00</div>
            </div>
          </RightTextArea>
          {/* <RightTextArea>
            <div>
              <h2>JOIN THE EXPERIENCE</h2>
              <p>Explore a world where imagination meets execution.</p>
            </div>
          </RightTextArea> */}
        </Content>
      </Container>
      <div style={{ height: "500vh" }} />
    </>
  );
}

export default MainUI;
