import axiox from "axios";

const API_BASE_URL = import.meta.env.API_BASE_URL;
const API_TIMEOUT = import.meta.env.API_TIMEOUT;
const API_TIMEOUT_INT = Number(API_TIMEOUT);

const api = axiox.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_INT,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
