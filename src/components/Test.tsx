import styled from "styled-components";

const MarqueeContainer = styled.div`
  display: flex;
  overflow: hidden;
  width: 100%;
`;

const MarqueeWrapper = styled.div`
  display: flex;
  animation: marquee 15s linear infinite;

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%); /* 중간까지 이동 */
    }
  }
`;

const MarqueeImage = styled.img`
  width: 20%;
  margin-right: 10px;
`;

interface TestProps {
  img: string[] | undefined;
}

const Test: React.FC<TestProps> = ({ img }) => {
  if (!img) return null;

  // 이미지 배열을 두 배로 만들어서 무한 반복처럼 보이게 함
  const repeatedImages = [...img, ...img];

  return (
    <MarqueeContainer>
      <MarqueeWrapper>
        {repeatedImages.map((image, index) => (
          <MarqueeImage key={index} src={`data:image/jpeg;base64,${image}`} alt={`image ${index + 1}`} />
        ))}
      </MarqueeWrapper>
    </MarqueeContainer>
  );
};

export default Test;
