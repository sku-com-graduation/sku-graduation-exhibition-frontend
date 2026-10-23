import axios from "axios";
import { clearAuth } from "@store/reducers/auth";
import store from "@store/store";
import { getCurrentYear } from "@src/lib/exhibition";

// 운영 서버는 같은 도메인의 /api 를 nginx가 백엔드로 넘긴다
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const API_TIMEOUT_INT = Number(import.meta.env.VITE_API_TIMEOUT) || 60000;

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
      window.location.href = `/${getCurrentYear()}`;
    }
    return Promise.reject(error);
  }
);

export default api;
