import { clearAuth } from "@src/store/reducers/auth";
import axios from "axios";
import store from "../store/store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT;
const API_TIMEOUT_INT = Number(API_TIMEOUT);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_INT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      alert("로그인이 만료되었습니다.");
      store.dispatch(clearAuth());
      window.location.href = `/${new Date().getFullYear()}`;
    }
    return Promise.reject(error);
  }
);

export default api;
