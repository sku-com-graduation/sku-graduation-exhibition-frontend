import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import theme from "./styles/theme";
import Header from "./components/Header";
import Footer from "./components/Footer";

import CustomCursor from "./components/CustomCursor";

import { AdminPage, MainPage, TeamPage, TeamEditPage, ProjectPage, YearHomePage } from "./pages";
import Test from "./pages/Test";
import MainUI from "./pages/MainUI";
import MainUI2 from "./pages/MainUI2";
import MainUI3 from "./pages/MainUI3";
import YearHomePagev2 from "./pages/YearHomePagev2";

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled(motion.div)`
  flex: 1;
  box-sizing: border-box;
  /* margin-top: 5rem; */
`;

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LayoutContainer>
    <Header />
    <Content
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeIn" }}
    >
      {children}
    </Content>
    <Footer />
  </LayoutContainer>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <CustomCursor />
      <Routes key={location.pathname} location={location}>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/:year/admin"
          element={
            <DefaultLayout>
              <AdminPage />
            </DefaultLayout>
          }
        />
        <Route
          path="/:year"
          element={
            <DefaultLayout>
              <YearHomePage />
            </DefaultLayout>
          }
        />
        <Route
          path="/:year/project"
          element={
            <DefaultLayout>
              <ProjectPage />
            </DefaultLayout>
          }
        />
        <Route
          path="/:year/project/:team_uuid"
          element={
            <DefaultLayout>
              <TeamPage />
            </DefaultLayout>
          }
        />
        <Route
          path="/:year/project/:team_uuid/edit"
          element={
            <DefaultLayout>
              <TeamEditPage />
            </DefaultLayout>
          }
        />
        {/* <Route
          path="/2026"
          element={
            <DefaultLayout>
              <YearHomePagev2 />
            </DefaultLayout>
          }
        />
        <Route path="/test" element={<Test />} />
        <Route path="/test2" element={<MainUI />} />
        <Route path="/test3" element={<MainUI2 />} />
        <Route path="/test4" element={<MainUI3 />} /> */}

        <Route path="*" element={<>NOT FOUND</>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
