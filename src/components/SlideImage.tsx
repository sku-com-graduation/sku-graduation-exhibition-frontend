import { getTeamProflies } from "@api/team";
import { useEffect, useState } from "react";
import styled from "styled-components";

const SliderWrapper = styled.div`
  overflow-x: hidden;
  width: 100%;
  margin: 3rem 0;
  box-sizing: border-box;
`;

const SlideTrack = styled.div<{ reverse?: boolean; duration: number }>`
  display: flex;
  width: max-content;
  animation: ${({ reverse, duration }) => `${reverse ? "slideReverse" : "slide"} ${duration}s linear infinite`};

  @keyframes slide {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes slideReverse {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(50%);
    }
  }
`;

const SliderImage = styled.img`
  width: 15rem;
  height: 15rem;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 10px;
  margin-right: 1rem;

  &:last-child {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    width: 10rem;
    height: 10rem;
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
  const [duration, setDuration] = useState<number>(60);

  useEffect(() => {
    async function loadImages() {
      const res = await fetchTeamProfile(year);
      if (res) {
        const repeated = Array(10).fill(res).flat();
        setImages(repeated);

        const baseSpeed = 2;
        const calculatedDuration = repeated.length * baseSpeed;
        setDuration(calculatedDuration);
      }
    }
    loadImages();
  }, [year]);

  return (
    <>
      <SliderWrapper>
        <SlideTrack duration={duration}>
          {images.map((src, idx) => (
            <SliderImage key={`row1-${idx}`} src={`data:image/jpeg;base64,${src}`} />
          ))}
        </SlideTrack>
      </SliderWrapper>
      <SliderWrapper>
        <SlideTrack reverse duration={duration}>
          {images.map((src, idx) => (
            <SliderImage key={`row2-${idx}`} src={`data:image/jpeg;base64,${src}`} />
          ))}
        </SlideTrack>
      </SliderWrapper>
    </>
  );
};

export default SlideImage;
