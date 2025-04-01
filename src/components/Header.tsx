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
import logo from "../assets/image/logo.png";
import { getYearRange } from "@src/utils/year";

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
    flex-wrap: nowrap; /* Prevent wrapping */
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
  const { openModal, Modal } = useModal();

  const controls = useAnimation();
  const { scrollY } = useViewportScroll();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((currentY) => {
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
    } catch (error) {
      console.error(error);
    }
  };

  const goToMyPage = () => {
    if (selectedAuth.role === "ADMIN") {
      navigate(`/${year}/admin`);
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
        <Login />
      </Modal>
    </>
  );
};

export default Header;

// import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import styled from "styled-components";
// import { motion, useAnimation, useViewportScroll } from "framer-motion";
// import { Login } from "./Login";
// import { useModal } from "../hooks/useModal";
// import { RootState } from "../store/store";
// import { clearAuth } from "../store/reducers/auth";
// import { getLogout } from "../api/auth";
// import { setExhibitionYear } from "../store/reducers/exhibitionYear";
// import { SelectCS } from "./Select";
// import logo from "../assets/image/logo.png";

// import { getYearRange } from "@src/utils/year";

// const Container = styled(motion.div)`
//   display: flex;
//   justify-content: space-between;

//   align-items: center;
//   position: fixed;
//   top: 1rem;
//   left: 1rem;
//   right: 1rem;
//   height: 4rem;
//   padding: 0 3rem;
//   box-sizing: border-box;
//   z-index: 1000;
//   border-radius: 2rem;

//   @media (max-width: 768px) {
//     gap: 1rem;
//     padding: 0 1rem;
//   }

//   @media (max-width: 430px) {
//     height: auto;
//     padding: 0.5rem 1rem;
//     gap: 0.5rem;
//   }
// `;

// const LeftContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 1rem;

//   @media (max-width: 430px) {
//     width: 100%;
//     justify-content: center;
//     flex-wrap: wrap;
//     gap: 0.5rem;
//   }
// `;

// const RightContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   cursor: pointer;

//   @media (max-width: 430px) {
//     width: 100%;
//     justify-content: center;
//     flex-wrap: wrap;
//     gap: 0.5rem;
//   }
// `;

// const Logo = styled.img`
//   width: 5rem;
//   font-weight: bold;
//   color: #555;
//   cursor: pointer;
//   transition: color 0.3s;

//   &:hover {
//     color: #0077fe;
//   }

//   @media (max-width: 430px) {
//     font-size: 1rem;
//   }
// `;

// const NavItem = styled.div`
//   font-size: 1rem;
//   color: #555;
//   transition: color 0.3s;

//   &:hover {
//     color: #0077fe;
//   }

//   @media (max-width: 430px) {
//     font-size: 0.9rem;
//   }
// `;

// const Header = () => {
//   const { year } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const selectedAuth = useSelector((state: RootState) => state.auth);
//   const { openModal, Modal } = useModal();

//   const controls = useAnimation();
//   const { scrollY } = useViewportScroll();
//   const lastScrollY = useRef(0);

//   useEffect(() => {
//     const unsubscribe = scrollY.onChange((currentY) => {
//       if (currentY > lastScrollY.current) {
//         // 스크롤 다운 시 헤더 숨김
//         controls.start({ y: "-100%" });
//       } else {
//         // 스크롤 업 시 헤더 표시
//         controls.start({ y: 0 });
//       }
//       lastScrollY.current = currentY;
//     });
//     return () => unsubscribe();
//   }, [scrollY, controls]);

//   const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedYear = e.target.value;
//     dispatch(setExhibitionYear(selectedYear));
//     navigate(`/${selectedYear}`);
//   };

//   const postLogout = async () => {
//     try {
//       await getLogout();
//       dispatch(clearAuth());
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const goToMyPage = () => {
//     if (selectedAuth.role === "ADMIN") {
//       navigate(`/${year}/admin`);
//     }
//   };

//   const years = getYearRange();

//   return (
//     <>
//       <Container animate={controls} initial={{ y: 0 }} transition={{ type: "tween", duration: 0.3 }}>
//         <LeftContainer>
//           <Logo src={logo} onClick={() => navigate(`/${year}`)} />
//           <SelectCS value={year} onChange={handleYearChange}>
//             <option value="" disabled hidden>
//               전시 연도
//             </option>
//             {years.map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </SelectCS>
//         </LeftContainer>
//         <RightContainer>
//           <NavItem onClick={() => navigate(`/${year}/project`)}>PROJECT</NavItem>
//           {selectedAuth.teamName ? (
//             <>
//               <NavItem onClick={goToMyPage}>{selectedAuth.teamName}</NavItem>
//               <NavItem onClick={postLogout}>LOGOUT</NavItem>
//             </>
//           ) : (
//             <NavItem onClick={openModal}>LOGIN</NavItem>
//           )}
//         </RightContainer>
//       </Container>
//       <Modal>
//         <Login />
//       </Modal>
//     </>
//   );
// };

// export default Header;
