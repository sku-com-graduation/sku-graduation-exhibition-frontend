import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import theme from "./styles/theme";
import PageRoutes from "./routes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <PageRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
