import styled from "styled-components";

import img1 from "../assets/image/img1.jpg";
// import { patchTeampostSlideImage } from "../api/teamPost";

// 이미지들을 담을 컨테이너
const MarqueeContainer = styled.div`
  display: flex;
  overflow: hidden; /* 컨테이너 밖으로 나가지 않도록 */
  width: 100%; /* 전체 화면 크기에 맞추기 */
`;

// 이미지를 흐르게 할 애니메이션
const MarqueeWrapper = styled.div`
  display: flex;
  animation: marquee 15s linear infinite; /* 애니메이션 15초, 무한 반복 */

  @keyframes marquee {
    0% {
      transform: translateX(0); /* 시작 위치 */
    }
    100% {
      transform: translateX(-100%); /* 끝 위치 */
    }
  }
`;

// 개별 이미지 스타일
const MarqueeImage = styled.img`
  width: 20%; /* 이미지 크기 설정 */
  margin-right: 10px; /* 이미지 사이 간격 */
`;

// const getSlideImage = async () => {
//   const res = await patchTeampostSlideImage()
// }

const Test = () => {
  return (
    <MarqueeContainer>
      <MarqueeWrapper>
        <MarqueeImage src={img1} alt="image 1" />
        <MarqueeImage src={img1} alt="image 1" />
        <MarqueeImage src={img1} alt="image 1" />
        <MarqueeImage src={img1} alt="image 1" />
        <MarqueeImage src={img1} alt="image 1" />
      </MarqueeWrapper>
    </MarqueeContainer>
  );
};

export default Test;
