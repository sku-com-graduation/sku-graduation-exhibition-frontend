import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Login } from "./Login";
import { useModal } from "../hooks/useModal";
import { RootState } from "../store/store";
import { clearAuth } from "../store/reducers/auth";

import { getLogout } from "../api/auth";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.25rem;
  height: 5rem;
  border-bottom: 1px solid #ebebeb;
`;

const LeftContainer = styled.div`
  box-sizing: border-box;

  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
`;

const RightContainer = styled.div`
  box-sizing: border-box;

  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 0.9375rem;
`;

const Logo = styled.div`
  box-sizing: border-box;

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
  box-sizing: border-box;

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
  }
`;

const Header = () => {
  const { year } = useParams();
  const seletedAuth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log(JSON.stringify(seletedAuth, null, 4));
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openModal, Modal } = useModal();

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = event.target.value;
    dispatch(setExhibitionYear(selectedYear));
    navigate(`/${selectedYear}`);
  };

  const postLogout = async () => {
    try {
      await getLogout();
      dispatch(clearAuth());
    } catch (error) {
      console.log(error);
    }
  };

  const myPage = () => {
    if (seletedAuth.role === "ADMIN") {
      navigate("/admin");
    }
  };

  return (
    <Container>
      <LeftContainer>
        <Logo onClick={() => navigate("/")}>SKU</Logo>
        <YearSelect value={year} onChange={handleYearChange}>
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
        <LoginDiv onClick={() => navigate(`/${year}/project`)}>PROJECT</LoginDiv>
        {seletedAuth.accessToken ? (
          <>
            <LoginDiv onClick={myPage}>{seletedAuth.teamName}</LoginDiv>
            <LoginDiv onClick={postLogout}>LOGOUT</LoginDiv>
          </>
        ) : (
          <LoginDiv onClick={openModal}>LOGIN</LoginDiv>
        )}
        <Modal>
          <Login />
        </Modal>
      </RightContainer>
    </Container>
  );
};

export default Header;
