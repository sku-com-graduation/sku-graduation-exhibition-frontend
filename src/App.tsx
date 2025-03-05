import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";

import theme from "./styles/theme";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import AdminPage from "./pages/AdminPage";
import ProjectPage from "./pages/ProjectPage";
import YearHomePage from "./pages/YearHomePage";
import ApiTest from "./api/ApiTest";
import TeamPage from "./pages/TeamPage";
import TeamEditPage from "./pages/TeamEditPage";

const Content = styled.div``;

const DefaultLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div style={{ width: "100%", boxSizing: "border-box" }}>
    <Header />
    <Content>{children}</Content>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/admin"
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
          <Route
            path="/api"
            element={
              <DefaultLayout>
                <ApiTest />
              </DefaultLayout>
            }
          />
          <Route path="*" element={<>NOT FOUND</>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
