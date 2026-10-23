import type { CSSProperties } from "react";
import { Outlet, ScrollRestoration, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { SiteFooter } from "@components/site/SiteFooter";
import { SiteHeader } from "@components/site/SiteHeader";
import { parseExhibitionYear, themeOf } from "@src/lib/exhibition";
import NotFound from "@src/pages/NotFound";
import { YearContext } from "./YearContext";

/** /:year 아래 모든 화면의 공통 틀. 연도를 검증하고 그해 테마 색을 CSS 변수로 내려준다. */
const RootLayout = () => {
  const year = parseExhibitionYear(useParams().year);
  if (year === null) return <NotFound />;

  const theme = themeOf(year);
  const vars = { "--accent": theme.accent, "--soft": theme.soft } as CSSProperties;

  return (
    <YearContext.Provider value={{ year, theme }}>
      <div style={{ ...vars, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <SiteHeader />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <SiteFooter />
      </div>
      <ToastContainer />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </YearContext.Provider>
  );
};

export default RootLayout;
