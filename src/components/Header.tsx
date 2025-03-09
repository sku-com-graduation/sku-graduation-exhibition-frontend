import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Login } from "./Login";
import { useModal } from "../hooks/useModal";
import { RootState } from "../store/store";
import { clearAuth } from "../store/reducers/auth";
import { getLogout } from "../api/auth";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";
import { SelectCS } from "./input/Select";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  display: grid;
  /* border-radius: 0 0 1rem 1rem; */
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.25rem;
  height: 5rem;
  border-bottom: 1px solid #ebebeb;
  background: white;
  transition: transform 0.3s ease-in-out;
  transform: translateY(0) translateX(-50%);
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const LeftContainer = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
`;

const RightContainer = styled.div`
  display: grid;
  box-sizing: border-box;
  grid-auto-flow: column;
  gap: 1rem;
`;

const Logo = styled.div`
  display: grid;
  color: #555;
  place-items: center;
  font-size: 1.2rem;
  padding-right: 10px;
  box-sizing: border-box;
  height: 100%;
  transition: color 0.3s, font-size 0.2s;
  cursor: pointer;

  &:hover {
    color: #0077fe;
    font-size: 1.2rem;
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openModal, Modal } = useModal();

  // useRef를 이용해 DOM에 직접 접근
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (headerRef.current) {
        // 스크롤 내릴 때는 헤더 숨김, 올릴 때는 보이게 처리
        if (currentScrollY > lastScrollY.current) {
          headerRef.current.style.transform = "translateY(-100%) translateX(-50%)";
        } else {
          headerRef.current.style.transform = "translateY(0) translateX(-50%)";
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      navigate(`/${year}/admin`);
    }
  };

  return (
    <Container ref={headerRef}>
      <LeftContainer>
        <Logo onClick={() => navigate("/")}>SKU</Logo>
        <SelectCS value={year} onChange={handleYearChange}>
          <option value="" disabled hidden>
            전시 연도
          </option>
          {["2025", "2024", "2023"].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectCS>
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
