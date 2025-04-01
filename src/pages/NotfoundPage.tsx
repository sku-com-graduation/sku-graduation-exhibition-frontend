import styled from "styled-components";
import i3 from "../assets/image/back_image.png";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${i3});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  text-align: center;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
`;

const Title = styled.h1`
  font-size: 6rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.85);
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: white;
    transform: translateY(-2px);
  }
`;

const NotfoundPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Wrapper>
      <Content>
        <Title>404</Title>
        <Subtitle>페이지를 찾을 수 없습니다</Subtitle>
        <Button onClick={() => navigate(`/${currentYear}`)}>{currentYear} 메인으로 돌아가기</Button>
      </Content>
    </Wrapper>
  );
};

export default NotfoundPage;
