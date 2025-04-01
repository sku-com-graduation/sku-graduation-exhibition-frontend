import React from "react";
import { Helmet } from "react-helmet";
import img from "./assets/image/main_image.png";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import theme from "./styles/theme";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { AdminPage, NotfoundPage, TeamPage, TeamEditPage, ProjectPage, YearHomePage } from "./pages";

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled(motion.div)`
  flex: 1;
  box-sizing: border-box;
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
      <Routes key={location.pathname} location={location}>
        {/* <Route path="/" element={<MainPage />} /> */}
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

        <Route path="*" element={<NotfoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <meta property="og:image" content={img} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
