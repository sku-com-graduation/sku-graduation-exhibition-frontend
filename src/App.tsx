import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PageRoutes from "./routes";

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <PageRoutes />
      </Router>
    </>
  );
}

export default App;
