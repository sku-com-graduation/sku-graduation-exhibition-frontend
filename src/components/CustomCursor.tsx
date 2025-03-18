import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    cursor: none !important;
  }
`;

// 펄스 애니메이션: 외곽 원이 살짝 커졌다 작아지면서 투명도가 변하는 효과
const pulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
`;

const Cursor = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: transform 150ms ease-out;

  /* 중앙의 컬러풀한 원 */
  &::before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #879fb6; /* 원의 색상은 필요에 따라 변경 가능 */
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  /* 외곽의 펄스 애니메이션이 적용된 원 */
  &::after {
    content: "";
    position: absolute;
    width: 36px;
    height: 36px;
    border: 2px solid #3ac9b6;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    animation: ${pulse} 10.5s infinite;
  }
`;

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Cursor
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;
