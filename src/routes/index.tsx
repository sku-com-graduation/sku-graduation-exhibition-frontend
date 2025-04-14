// routes.tsx
import { AdminPage, NotfoundPage, TeamPage, TeamEditPage, ProjectPage, YearHomePage } from "@pages";
import DefaultLayout from "@components/layout/DefaultLayout";
import App from "../App";

import { useLocation, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
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

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "*",
        element: <AnimatedRoutes />,
      },
    ],
  },
];

export default routes;

// import { Routes, Route, useLocation } from "react-router-dom";
// import { AnimatePresence } from "framer-motion";

// import { AdminPage, NotfoundPage, TeamPage, TeamEditPage, ProjectPage, YearHomePage } from "@pages";
// import DefaultLayout from "@components/layout/DefaultLayout";

// const PageRoutes = () => {
//   const location = useLocation();

//   return (
//     <AnimatePresence mode="wait">
//       <Routes location={location} key={location.pathname}>
//         <Route
//           path="/:year/admin"
//           element={
//             <DefaultLayout>
//               <AdminPage />
//             </DefaultLayout>
//           }
//         />
//         <Route
//           path="/:year"
//           element={
//             <DefaultLayout>
//               <YearHomePage />
//             </DefaultLayout>
//           }
//         />
//         <Route
//           path="/:year/project"
//           element={
//             <DefaultLayout>
//               <ProjectPage />
//             </DefaultLayout>
//           }
//         />
//         <Route
//           path="/:year/project/:team_uuid"
//           element={
//             <DefaultLayout>
//               <TeamPage />
//             </DefaultLayout>
//           }
//         />
//         <Route
//           path="/:year/project/:team_uuid/edit"
//           element={
//             <DefaultLayout>
//               <TeamEditPage />
//             </DefaultLayout>
//           }
//         />
//         <Route path="*" element={<NotfoundPage />} />
//       </Routes>
//     </AnimatePresence>
//   );
// };

// export default PageRoutes;
