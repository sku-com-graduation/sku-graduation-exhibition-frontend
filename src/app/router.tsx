import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { getCurrentYear } from "@src/lib/exhibition";
import NotFound from "@src/pages/NotFound";
import { RequireAdmin, RequireTeamOrAdmin } from "./guards";
import RootLayout from "./RootLayout";

const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

const routes: RouteObject[] = [
  { path: "/", element: <Navigate to={`/${getCurrentYear()}`} replace /> },
  {
    path: "/:year",
    element: <RootLayout />,
    errorElement: <NotFound />,
    hydrateFallbackElement: <div aria-busy="true" style={{ minHeight: "100vh" }} />,
    children: [
      { index: true, lazy: page(() => import("@src/pages/YearHomePage")) },
      { path: "project", lazy: page(() => import("@src/pages/ProjectPage")) },
      { path: "project/:team_uuid", lazy: page(() => import("@src/pages/TeamPage")) },
      {
        path: "project/:team_uuid/edit",
        lazy: async () => {
          const { default: TeamEditPage } = await import("@src/pages/TeamEditPage");
          return {
            Component: () => (
              <RequireTeamOrAdmin>
                <TeamEditPage />
              </RequireTeamOrAdmin>
            ),
          };
        },
      },
      {
        path: "admin",
        lazy: async () => {
          const { default: AdminPage } = await import("@src/pages/AdminPage");
          return {
            Component: () => (
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            ),
          };
        },
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];

export const router = createBrowserRouter(routes);
