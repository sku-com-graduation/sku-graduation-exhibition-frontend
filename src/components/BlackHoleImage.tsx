import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import styled from "styled-components";
import { useState } from "react";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
`;

const MaskedDiv = styled(motion.div)`
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 30%,
    transparent var(--hole-size),
    rgba(0, 0, 0, 0.8) calc(var(--hole-size) + 1%),
    black calc(var(--hole-size) + 10%)
  );
`;

const BlackHoleImage = () => {
  const { scrollY } = useScroll();
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  const holeSize = useTransform(scrollY, [0, 500], ["15%", "100%"]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.5]);
  const opacity = useTransform(scrollY, [400, 500], [1, 0]);

  // 오버레이 사라지면 아예 제거
  useMotionValueEvent(opacity, "change", (latest) => {
    if (latest === 0) {
      setOverlayVisible(false);
    }
  });

  return (
    overlayVisible && (
      <Overlay style={{ scale, opacity }}>
        <MaskedDiv style={{ "--hole-size": holeSize } as React.CSSProperties} />
      </Overlay>
    )
  );
};

export default BlackHoleImage;
