import { createRoot } from "react-dom/client";
import "./style/global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { queryClient } from "./app/queryClient";
import { router } from "./app/router";
import store, { persistor } from "./store/store";

void import("./style/fonts.css");

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
