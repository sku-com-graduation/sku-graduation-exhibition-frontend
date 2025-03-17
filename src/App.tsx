import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

import theme from "./styles/theme";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import AdminPage from "./pages/AdminPage";
import ProjectPage from "./pages/ProjectPage";
import YearHomePage from "./pages/YearHomePage";
import ApiTest from "./api/apiTest";
import TeamPage from "./pages/TeamPage";
import TeamEditPage from "./pages/TeamEditPage";

const Content = styled(motion.div)`
  padding-top: 5rem;
`;

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{ width: "100%", boxSizing: "border-box" }}
  >
    <Header />
    <Content>{children}</Content>
    <Footer />
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
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

// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import styled, { ThemeProvider } from "styled-components";

// import theme from "./styles/theme";
// import Header from "./components/Header";
// import Footer from "./components/Footer";
// import MainPage from "./pages/MainPage";
// import AdminPage from "./pages/AdminPage";
// import ProjectPage from "./pages/ProjectPage";
// import YearHomePage from "./pages/YearHomePage";
// import ApiTest from "./api/apiTest";
// import TeamPage from "./pages/TeamPage";
// import TeamEditPage from "./pages/TeamEditPage";

// const Content = styled.div`
//   padding-top: 5rem;
// `;

// const DefaultLayout: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => (
//   <div style={{ width: "100%", boxSizing: "border-box" }}>
//     <Header />
//     <Content>{children}</Content>
//     <Footer />
//   </div>
// );

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <Router>
//         <Routes>
//           <Route path="/" element={<MainPage />} />
//           <Route
//             path="/:year/admin"
//             element={
//               <DefaultLayout>
//                 <AdminPage />
//               </DefaultLayout>
//             }
//           />
//           <Route
//             path="/:year"
//             element={
//               <DefaultLayout>
//                 <YearHomePage />
//               </DefaultLayout>
//             }
//           />
//           <Route
//             path="/:year/project"
//             element={
//               <DefaultLayout>
//                 <ProjectPage />
//               </DefaultLayout>
//             }
//           />
//           <Route
//             path="/:year/project/:team_uuid"
//             element={
//               <DefaultLayout>
//                 <TeamPage />
//               </DefaultLayout>
//             }
//           />
//           <Route
//             path="/:year/project/:team_uuid/edit"
//             element={
//               <DefaultLayout>
//                 <TeamEditPage />
//               </DefaultLayout>
//             }
//           />
//           <Route
//             path="/api"
//             element={
//               <DefaultLayout>
//                 <ApiTest />
//               </DefaultLayout>
//             }
//           />
//           <Route path="*" element={<>NOT FOUND</>} />
//         </Routes>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;
