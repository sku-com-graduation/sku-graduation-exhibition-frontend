import { ThemeProvider } from "styled-components";
import theme from "./styles/theme";
import { Header } from "./components/Header";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

function App() {
  const params = useParams();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/:year" element={<>year</>} />
          <Route path="/:year/project" element={<>{params.year}year 별 프로젝트</>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
