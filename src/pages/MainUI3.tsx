import { motion, useViewportScroll, useTransform } from "framer-motion";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import v from "../assets/video/v3.mp4";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  box-sizing: border-box;
`;

const LogoWrapper = styled(motion.div)`
  width: 100%;
  height: 100vh;
  background: #fffefc;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
`;

const Logo = styled(motion.div)`
  font-size: 5vw;
  mix-blend-mode: color-burn;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  z-index: 2;
`;

const MaskedVideo = styled.video<{ $maskSize: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;

  mask-image: radial-gradient(
    circle at var(--x, 50%) var(--y, 50%),
    white ${({ $maskSize }) => $maskSize},
    transparent calc(${({ $maskSize }) => $maskSize} + 1vw)
  );
  -webkit-mask-image: radial-gradient(
    circle at var(--x, 50%) var(--y, 50%),
    white ${({ $maskSize }) => $maskSize},
    transparent calc(${({ $maskSize }) => $maskSize} + 1vw)
  );

  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  transition: mask-image 1s ease-out, -webkit-mask-image 1s ease-out;
  pointer-events: none;
`;

// Content는 margin-top: 100vh를 주어 첫 화면 아래에 위치하고,
// position 및 z-index를 지정해 LogoWrapper보다 위에 표시되도록 합니다.
const Content = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  background: #f7f7f7;
  padding: 5rem 2rem;
  font-size: 2rem;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 100vh;
  position: relative;
  z-index: 1;
`;

const MainUI3 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [maskSize, setMaskSize] = useState("15vw");
  const [expanded, setExpanded] = useState(false);

  const { scrollY } = useViewportScroll();
  const yRange = useTransform(scrollY, [0, window.innerHeight], [100, 0]);
  // 스크롤에 따라 LogoWrapper의 투명도를 1에서 0으로 애니메이션합니다.
  const videoOpacity = useTransform(scrollY, [0, window.innerHeight], [1, 0]);

  useEffect(() => {
    if (expanded) {
      // 클릭 시 마스크 크기 애니메이션
      let start = 0;
      const from = 15;
      const to = 150;
      const duration = 2000;

      const animateSize = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = from + (to - from) * eased;
        setMaskSize(`${current}vw`);

        if (progress < 1) requestAnimationFrame(animateSize);
      };

      requestAnimationFrame(animateSize);
      return;
    }

    // 초기 마스크 위치 애니메이션
    const start = Date.now();
    const duration = 2000;

    const animateMask = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const y = 100 - 50 * eased;

      if (videoRef.current) {
        videoRef.current.style.setProperty("--x", "50%");
        videoRef.current.style.setProperty("--y", `${y}%`);
      }

      if (progress < 1) requestAnimationFrame(animateMask);
    };

    animateMask();
  }, [expanded]);

  return (
    <Wrapper>
      <LogoWrapper onClick={() => setExpanded(true)} style={{ opacity: videoOpacity }}>
        <MaskedVideo ref={videoRef} autoPlay loop muted playsInline $maskSize={maskSize}>
          <source src={v} type="video/mp4" />
        </MaskedVideo>
        <Logo>GRADUATION EXHIBITION</Logo>
      </LogoWrapper>

      {/* 스크롤에 따라 Content가 아래에서 위로 등장 */}
      <motion.div style={{ y: yRange }}>
        <Content>👋 Welcome to the next section! Add anything you want here.</Content>
      </motion.div>
    </Wrapper>
  );
};

export default MainUI3;
