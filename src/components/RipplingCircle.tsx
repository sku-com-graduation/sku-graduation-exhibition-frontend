import React from "react";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface WaveProps {
  bgColor: string;
  duration: string;
}

const Container = styled.div`
  position: absolute;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
`;

const Wave = styled.div<WaveProps>`
  position: absolute;
  width: 400px;
  height: 400px;
  border-top-left-radius: 40%;
  border-top-right-radius: 45%;
  border-bottom-left-radius: 35%;
  border-bottom-right-radius: 40%;
  z-index: -1;
  background-color: ${(props) => props.bgColor};
  animation: ${rotate} ${(props) => props.duration} infinite linear;
`;

const waveConfigs: WaveProps[] = [
  { bgColor: "rgba(69, 87, 144, 0.15)", duration: "6s" },
  { bgColor: "rgba(2, 28, 144, 0.2)", duration: "7s" },
  { bgColor: "rgba(69, 105, 144, 0.2)", duration: "8s" },
  { bgColor: "rgba(2, 59, 144, 0.15)", duration: "5s" },
  { bgColor: "rgba(56, 59, 243, 0.25)", duration: "9s" },
];

const AnimatedWaves: React.FC = () => {
  return (
    <Container>
      {waveConfigs.map((config, index) => (
        <Wave key={index} {...config} />
      ))}
    </Container>
  );
};

export default AnimatedWaves;
