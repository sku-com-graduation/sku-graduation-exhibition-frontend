import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useMotionValueEvent,
  animate,
} from "framer-motion";
import styled from "styled-components";
import { useEffect, useState } from "react";

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
    /* circle at 17% 50%, */ circle at var(--x, 50%) var(--y, 50%),
    transparent var(--hole-size),
    rgba(0, 0, 0, 0.8) calc(var(--hole-size) + 1%),
    black calc(var(--hole-size) + 2%)
  );
`;

const BlackHoleImage = () => {
  const { scrollY } = useScroll();
  const [permanentlyGone, setPermanentlyGone] = useState(false);

  // 움직이는 스포트라이트 중심
  const x = useMotionValue(0);
  const y = useMotionValue(100); // 기본 중앙

  const xSpring = useSpring(x, { stiffness: 80, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 80, damping: 20 });

  const xTemplate = useMotionTemplate`${xSpring}%`;
  const yTemplate = useMotionTemplate`${ySpring}%`;

  // 구멍 크기, 스케일, 투명도 애니메이션
  const rawHoleSize = useTransform(scrollY, [0, 100], ["13%", "100%"]);
  const holeSize = useSpring(rawHoleSize, { stiffness: 60, damping: 20 });

  const rawScale = useTransform(scrollY, [0, 100], [1, 1.5]);
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });

  const rawOpacity = useTransform(scrollY, [10, 100], [1, 0]);
  const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 30 });

  // 최초 진입 시 중심 위치 이동
  useEffect(() => {
    const directions = [
      [0, 50], // 왼쪽
      [100, 50], // 오른쪽
      [50, 0], // 위쪽
      [50, 100], // 아래쪽
      [0, 0], // 좌상단
      [100, 0], // 우상단
      [0, 100], // 좌하단
      [100, 100], // 우하단
      [25, 25], // 중간-좌상단
      [75, 25], // 중간-우상단
      [25, 75], // 중간-좌하단
      [75, 75], // 중간-우하단
      [50, 25], // 위쪽 중간
      [50, 75], // 아래쪽 중간
      [25, 50], // 왼쪽 중간
      [75, 50], // 오른쪽 중간
    ];

    const [startX, startY] = directions[Math.floor(Math.random() * directions.length)];

    x.set(startX);
    y.set(startY);

    animate(x, 16, { duration: 2 });
    animate(y, 50, { duration: 2 });
  }, [x, y]);

  // opacity가 0 되면 제거
  useMotionValueEvent(opacity, "change", (latest) => {
    if (latest <= 0 && !permanentlyGone) {
      setPermanentlyGone(true);
    }
  });

  if (permanentlyGone) return null;

  return (
    <>
      <Overlay style={{ scale, opacity }}>
        <MaskedDiv
          style={
            {
              "--hole-size": holeSize,
              "--x": xTemplate,
              "--y": yTemplate,
            } as React.CSSProperties
          }
        />
      </Overlay>
    </>
  );
};

export default BlackHoleImage;
