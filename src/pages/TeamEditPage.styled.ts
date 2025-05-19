/* ────────────────
   Styled Components
   ──────────────── */

import styled from "styled-components";

export const AddMediaButton = styled.div`
  width: 100%;
  border-radius: 1rem;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  color: #999;
  font-size: 2rem;
  cursor: pointer;

  &:hover {
    background-color: #eaeaea;
  }
`;

export const SquareMediaButton = styled(AddMediaButton)`
  aspect-ratio: 1 / 1;
`;

export const PosterMediaButton = styled(AddMediaButton)`
  aspect-ratio: 3 / 4; // 세로형 포스터 비율
`;

export const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: repeat(5, auto);
  gap: 3rem;
  place-items: center;
  margin-bottom: 5rem;
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
  box-sizing: border-box;
  padding: 4rem;
  border-radius: 1rem;
  background-color: #f9f9f9;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  justify-items: center;
  text-align: left;
  margin-top: 5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 2rem;
  }
`;

export const TeamProfile = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  transition: filter 0.3s ease-in-out;

  &:hover {
    filter: brightness(50%);
  }

  @media (max-width: 768px) {
    width: 15rem;
    height: 15rem;
    margin: 0 auto;
  }
`;

export const CharCount = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
`;

export const PosterIntro = styled.div`
  width: 100%;
  max-width: 80rem;
  display: grid;
  place-items: center;
`;

export const PosterImg = styled.img`
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: contain;
  border-radius: 1rem;
  /* width: 100%;
  height: auto;
  object-fit: cover;
  max-width: 100%; */
`;

export const SaveButton = styled.button`
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

  &:hover {
    background-color: #005bb5;
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
`;

export const FileFormatNotice = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;

  &:hover .overlay {
    opacity: 1;
  }
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
`;

export const StudentList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const StudentItem = styled.div`
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

export const CategorySelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #fff;
  color: #333;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;
