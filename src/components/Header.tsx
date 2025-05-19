import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, useAnimation, useScroll } from "framer-motion";
import { Login } from "./Login";
import { useModal, useToast } from "@hooks";
import { RootState } from "@store/store";
import { clearAuth } from "@store/reducers/auth";
import { getLogout } from "@api/auth";
import { setExhibitionYear } from "@store/reducers/exhibitionYear";
import { SelectCS } from "./Select";
import logo from "@assets/image/logo.png";
import { getYearRange } from "@utils/year";

const Container = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  height: 4rem;
  padding: 0 3rem;
  box-sizing: border-box;
  z-index: 1000;
  border-radius: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 1rem;
  }

  @media (max-width: 430px) {
    height: auto;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 430px) {
    flex: 1;
    gap: 0.5rem;
    justify-content: flex-start;
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 430px) {
    flex: 1;
    justify-content: flex-end;
    gap: 0.5rem;
  }
`;

const Logo = styled.img`
  width: 5rem;
  cursor: pointer;
  transition: opacity 0.3s;
  image-rendering: auto;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 430px) {
    width: 3rem;
  }
`;

const NavItem = styled.div`
  font-size: 1rem;
  color: #555;
  transition: color 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    color: #0077fe;
  }

  @media (max-width: 430px) {
    font-size: 0.8rem;
  }
`;

const Header = () => {
  const { year } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedAuth = useSelector((state: RootState) => state.auth);
  const { openModal, closeModal, Modal } = useModal();
  const { notifySuccess, notifyError, notifyInfo } = useToast();

  const controls = useAnimation();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (currentY) => {
      if (currentY > lastScrollY.current) {
        controls.start({ y: "-100%" });
      } else {
        controls.start({ y: 0 });
      }
      lastScrollY.current = currentY;
    });
    return () => unsubscribe();
  }, [scrollY, controls]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value;
    dispatch(setExhibitionYear(selectedYear));
    navigate(`/${selectedYear}`);
  };

  const postLogout = async () => {
    try {
      await getLogout();
      dispatch(clearAuth());
      notifySuccess(`로그아웃`);
      const currentPath = location.pathname;
      if (currentPath.includes("/edit") || currentPath.includes("/admin")) {
        navigate(`/${year}`);
      }
    } catch (error) {
      console.error();
    }
  };

  const goToMyPage = () => {
    if (selectedAuth.role === "ADMIN") {
      navigate(`/${year}/admin`);
    } else {
      navigate(`/${year}/project/${selectedAuth.uuid}`);
    }
  };

  const years = getYearRange();

  return (
    <>
      <Container animate={controls} initial={{ y: 0 }} transition={{ type: "tween", duration: 0.3 }}>
        <LeftContainer>
          <Logo src={logo} onClick={() => navigate(`/${year}`)} />
          <SelectCS value={year} onChange={handleYearChange}>
            <option value="" disabled hidden>
              전시 연도
            </option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectCS>
        </LeftContainer>
        <RightContainer>
          <NavItem onClick={() => navigate(`/${year}/project`)}>PROJECT</NavItem>
          {selectedAuth.teamName ? (
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
        <Login onSuccess={closeModal} />
      </Modal>
    </>
  );
};

export default Header;
