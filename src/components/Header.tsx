import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useModal } from "../hooks/useModal";
import { Login } from "./Login";

const Container = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.25rem;
  width: 100%;
  height: 5rem;
  border-bottom: 1px solid #ebebeb;
`;

const LeftContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
`;

const RightContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 0.9375rem;
`;

const Logo = styled.div`
  font-size: 1.2rem;
  padding-right: 10px;
  border-right: 1px solid #333;
  height: 100%;
  transition: color 0.3s, font-size 0.2s;
  cursor: pointer;
  &:hover {
    color: #0077fe;
    font-size: 1.2rem;
  }
`;

const YearSelect = styled.select`
  font-size: 1rem;
  color: #333;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  appearance: none;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  option {
    font-size: 1rem;
    padding: 0.3125rem;
  }
`;

const LoginDiv = styled.div`
  font-size: 1rem;
  color: #555;
  transition: color 0.3s, font-size 0.2s;
  cursor: pointer;
  &:hover {
    color: #0077fe;
    font-size: 1.2rem;
  }
`;

const Header = () => {
  const { year } = useParams();
  const [choiceYear, setChoiceYear] = useState<string | undefined>(year);
  const navigate = useNavigate();
  const { openModal, Modal } = useModal();

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = event.target.value;
    setChoiceYear(selectedYear);
    navigate(`/${selectedYear}`);
  };

  return (
    <Container>
      <LeftContainer>
        <Logo>SKU</Logo>
        <YearSelect value={choiceYear} onChange={handleYearChange}>
          <option value="" disabled hidden>
            전시 연도
          </option>
          {["2025", "2024", "2023"].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </YearSelect>
      </LeftContainer>

      <RightContainer>
        <LoginDiv>PROJECT</LoginDiv>
        <LoginDiv onClick={openModal}>LOGIN</LoginDiv>
        <Modal>
          <Login />
        </Modal>
      </RightContainer>
    </Container>
  );
};

export default Header;
