import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_KEY_NAME = import.meta.env.VITE_AUTH_KEY_NAME;
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

// 요청 인터셉터 - 인증이 필요한 API만 Authorization 추가
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(AUTH_KEY_NAME);
    if (token && !config.url?.startsWith("/public")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("토큰이 만료되었습니다. 다시 로그인하세요.");
      sessionStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default api;
