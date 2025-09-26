// TeamPage.styled.ts
import styled from "styled-components";
import { motion } from "framer-motion";

export const StudentBadge = styled.div`
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #ffffff;
  background-color: #2a4fa4;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  display: inline-block;
`;

export const ProfessorBadge = styled(StudentBadge)`
  background-color: #8a2be2;
`;

export const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 3rem;
  place-items: center;
  padding-top: 5rem;
`;

export const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
`;

export const TeamIntro = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 2rem;
  padding: 4rem 8rem;
  box-sizing: border-box;
  border-radius: 1rem;
  background-color: #f9f9f9;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 2rem;
  }
`;

export const TeamTitle = styled.h1`
  font-size: 2.6rem;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.05rem;
  margin-bottom: 1rem;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
    font-size: 2.2rem;
  }
`;

export const TeamContent = styled.div`
  width: 80%;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  letter-spacing: 0.05rem;
  text-align: justify;
  padding: 0.5rem 0;
  white-space: pre-line;
  margin-top: 1rem;

  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

export const TeamProfile = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  grid-row: span 2;
  transition: transform 0.3s ease-in-out;
  margin: 0 auto;
  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
  }
`;

export const VideoIntro = styled.div`
  width: 100%;
  max-width: 60rem;
  overflow: hidden;
  padding: 1rem;
`;

export const EmptyVideoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #f0f0f0;
  border: 0.2rem dashed #ccc;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
`;

export const TeamVideo = styled.video`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  border-radius: 1rem;
  background-color: black;
`;

export const PosterIntro = styled.div`
  width: 60%;
  display: grid;
  place-items: center;
  margin-bottom: 10rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const PosterImg = styled.img`
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: contain;
  border-radius: 1rem;
`;

export const EditButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
`;

export const SideButton = styled(motion.button)`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.8rem;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.2);
  }
`;

export const PrevButton = styled(SideButton)`
  left: 1rem;
`;

export const NextButton = styled(SideButton)`
  right: 1rem;
`;

export const MemberList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const StudentItem = styled.div`
  text-align: center;
`;

export const ProfessorItem = styled.div`
  text-align: center;
`;

export const StudentInfo = styled.img`
  width: 10rem;
  height: 10rem;
  border-radius: 5rem;
  border: 0.1rem solid #d8d8d8;
  object-fit: cover;
  transition: filter 0.3s ease-in-out;
  &:hover {
    filter: brightness(50%);
  }
  @media (max-width: 768px) {
    width: 4.5rem;
    height: 4.5rem;
  }
`;

export const StudentName = styled.div`
  margin-top: 0.5rem;
`;

export const ProfessorName = styled(StudentName)``;

export const TocWrapper = styled.ul`
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  list-style: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 0.85rem;
  z-index: 1000;
`;

export const TocItem = styled.li<{ active: boolean }>`
  margin: 0.5rem 0;
  a {
    color: ${({ active }) => (active ? "#0070f3" : "#333")};
    font-weight: ${({ active }) => (active ? 600 : 400)};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
