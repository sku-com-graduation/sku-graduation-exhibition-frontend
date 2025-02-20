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

const Content = styled.div``;

const DefaultLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <>
    <Header />
    <Content>{children}</Content>
    <Footer />
  </>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminPage />} />
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
