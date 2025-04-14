// main.tsx
import { createRoot } from "react-dom/client";
import "./style/global.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);

// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./style/global.css";

// // reducer
// import { Provider } from "react-redux";
// import store, { persistor } from "./store/store.ts";
// import { PersistGate } from "redux-persist/integration/react";

// createRoot(document.getElementById("root")!).render(
//   <Provider store={store}>
//     <PersistGate loading={null} persistor={persistor}>
//       <App />
//     </PersistGate>
//   </Provider>
// );
