import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    cursor: none !important;
  }
`;

const Cursor = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #8fc3ff; /* 내부 원 색상 */
  border-radius: 50%;
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
      {/* <GlobalStyle />
      <Cursor
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      /> */}
    </>
  );
};

export default CustomCursor;
