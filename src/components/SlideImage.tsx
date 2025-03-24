import { getTeamProflies } from "@src/api/team";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";

const SliderWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  margin: 3rem 0;
`;

const SlideTrack = styled.div<{ reverse?: boolean }>`
  display: flex;
  width: max-content;
  animation: ${({ reverse }) => (reverse ? "slideReverse" : "slide")} 30s linear infinite;

  @keyframes slide {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes slideReverse {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0%);
    }
  }
`;

const SliderImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 10px;
  margin-right: 1rem;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const fetchTeamProfile = async (year: string) => {
  try {
    const res: string[] = await getTeamProflies(year);
    return res;
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const SlideImage: React.FC<{ year: string }> = ({ year }) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadImages() {
      const res = await fetchTeamProfile(year);
      if (res) {
        const repeated = [...res, ...res, ...res]; // 반복으로 무한 루프 느낌
        setImages(repeated);
      }
    }
    loadImages();
  }, [year]);

  return (
    <>
      <SliderWrapper>
        <SlideTrack>
          {images.map((src, idx) => (
            <SliderImage key={`row1-${idx}`} src={`data:image/jpeg;base64,${src}`} />
          ))}
        </SlideTrack>
      </SliderWrapper>
      <SliderWrapper>
        <SlideTrack reverse>
          {images.map((src, idx) => (
            <SliderImage key={`row2-${idx}`} src={`data:image/jpeg;base64,${src}`} />
          ))}
        </SlideTrack>
      </SliderWrapper>
    </>
  );
};

export default SlideImage;
