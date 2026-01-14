import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoutesFromElements, Route } from "react-router";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import store from "./redux/store.js";
import { Provider } from "react-redux";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import axios from "axios";
import PrivateRoute from "./redux/features/auth/PrivateRoute.jsx";
import NonAuthenticatedUser from "./redux/features/auth/NonAuthenticatedUser.jsx";

axios.defaults.withCredentials = true;

const queryClient = new QueryClient({});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      
      <Route element={<PrivateRoute />}>
        <Route index element={<Home />} />

      </Route>

      
      <Route element={<NonAuthenticatedUser />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </QueryClientProvider>
);
