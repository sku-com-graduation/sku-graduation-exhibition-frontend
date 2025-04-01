import api from ".";
import { IAuth } from "../interface";

/** login API */
export const postAuth = async (userName: string, password: string): Promise<IAuth> => {
  try {
    const result = await api.post("/public/account/login", { userName, password });

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
