import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

/**
 * 울퉁불퉁한 원을 그리는 예시 Path 세 가지
 * 실제 프로젝트에서는 SVG 편집기(피그마, 일러스트레이터 등)를 사용해 원하는 모양을 만들어보세요.
 */
const PATH_1 = `
  M150,50
  C180,30,220,80,230,120
  C240,180,180,180,150,190
  C110,200,80,150,70,110
  C60,70,120,40,150,50
  Z
`;

const PATH_2 = `
  M150,60
  C170,40,210,90,220,120
  C230,160,190,180,150,180
  C110,180,60,140,80,100
  C100,60,120,80,150,60
  Z
`;

const PATH_3 = `
  M140,70
  C160,50,200,70,210,110
  C220,160,180,190,130,190
  C100,190,80,160,70,130
  C60,100,100,90,140,70
  Z
`;

/** 컨테이너: 겹쳐진 SVG와 중앙 텍스트 */
const Container = styled.div`
  position: relative;
  display: inline-block;
  width: 300px;
  height: 300px;
`;

/** 각 Blob은 제자리에서 회전하도록 transform-origin을 설정 */
const BlobOne = styled(motion.svg)`
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  transform-origin: 50% 50%;
`;

const BlobTwo = styled(motion.svg)`
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  transform-origin: 50% 50%;
`;

const BlobThree = styled(motion.svg)`
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  transform-origin: 50% 50%;
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
`;

const AbstractLogo: React.FC = () => {
  return (
    <Container>
      {/* 첫 번째 울퉁불퉁한 원: 제자리에서 360도 회전 */}
      <BlobOne
        animate={{ rotate: 360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        viewBox="0 0 300 300"
      >
        <path d={PATH_1} fill="#2168db" opacity={0.9} />
      </BlobOne>

      {/* 두 번째 울퉁불퉁한 원 */}
      <BlobTwo
        animate={{ rotate: 360 }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
        viewBox="0 0 300 300"
      >
        <path d={PATH_2} fill="#297bee" opacity={0.7} />
      </BlobTwo>

      {/* 세 번째 울퉁불퉁한 원 */}
      <BlobThree
        animate={{ rotate: 360 }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "linear",
        }}
        viewBox="0 0 300 300"
      >
        <path d={PATH_3} fill="#3b8cf8" opacity={0.5} />
      </BlobThree>

      {/* 중앙 텍스트 */}
      <CenterText>
        ABSTRACT
        <br />
        logo
      </CenterText>
    </Container>
  );
};

export default AbstractLogo;
