import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";

import theme from "./styles/theme";
import PageRoutes from "./routes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <Router>
        <PageRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
