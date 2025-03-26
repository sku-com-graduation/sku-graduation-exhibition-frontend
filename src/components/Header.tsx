import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, useAnimation, useViewportScroll } from "framer-motion";
import { Login } from "./Login";
import { useModal } from "../hooks/useModal";
import { RootState } from "../store/store";
import { clearAuth } from "../store/reducers/auth";
import { getLogout } from "../api/auth";
import { setExhibitionYear } from "../store/reducers/exhibitionYear";
import { SelectCS } from "./Select";

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rem 3rem;
  height: 4rem;
  z-index: 1000;
  /* background: #d1d1d1; */
  /* border: 0.3rem solid #fff; */
  border-radius: 5rem;
  box-sizing: border-box;
  margin: 1rem;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;

  transition: color 0.3s;

  &:hover {
    color: #0077fe;
  }
`;

const NavItem = styled.div`
  font-size: 1rem;
  color: #555;

  transition: color 0.3s;

  &:hover {
    color: #0077fe;
  }
`;

const Header = () => {
  const { year } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedAuth = useSelector((state: RootState) => state.auth);
  const { openModal, Modal } = useModal();

  const controls = useAnimation();
  // const { scrollY } = useViewportScroll();
  // const lastScrollY = useRef(0);

  // useEffect(() => {
  //   const unsubscribe = scrollY.onChange((currentY) => {
  //     if (currentY > lastScrollY.current) {
  //       // 스크롤 다운 시 헤더 숨김
  //       controls.start({ y: "-100%" });
  //     } else {
  //       // 스크롤 업 시 헤더 표시
  //       controls.start({ y: 0 });
  //     }
  //     lastScrollY.current = currentY;
  //   });
  //   return () => unsubscribe();
  // }, [scrollY, controls]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value;
    dispatch(setExhibitionYear(selectedYear));
    navigate(`/${selectedYear}`);
  };

  const postLogout = async () => {
    try {
      await getLogout();
      dispatch(clearAuth());
    } catch (error) {
      console.error(error);
    }
  };

  const goToMyPage = () => {
    if (selectedAuth.role === "ADMIN") {
      navigate(`/${year}/admin`);
    }
  };

  return (
    <>
      <Container animate={controls} initial={{ y: 0 }} transition={{ type: "tween", duration: 0.3 }}>
        <LeftContainer>
          <Logo onClick={() => navigate(`/${year}`)}>SKU</Logo>
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
          <NavItem onClick={() => navigate(`/${year}/project`)}>PROJECT</NavItem>
          {selectedAuth.accessToken ? (
            <>
              <NavItem onClick={goToMyPage}>{selectedAuth.teamName}</NavItem>
              <NavItem onClick={postLogout}>LOGOUT</NavItem>
            </>
          ) : (
            <NavItem onClick={openModal}>LOGIN</NavItem>
          )}
        </RightContainer>
      </Container>
      <Modal>
        <Login />
      </Modal>
    </>
  );
};

export default Header;
