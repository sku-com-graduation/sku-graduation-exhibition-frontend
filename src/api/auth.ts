import api from ".";
import IAuth from "../types/IAuth";

/** login API */
export const postAuth = async (userName: string, password: string): Promise<IAuth> => {
  try {
    const result = await api.post("/public/account/login", { userName, password });

    const AUTH_KEY_NAME = import.meta.env.VITE_AUTH_KEY_NAME;
    sessionStorage.setItem(AUTH_KEY_NAME, result.data.accessToken);

    return result.data;
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
};

/** logout API */
export const getLogout = async () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    throw new Error(`${error}`);
  }
};
