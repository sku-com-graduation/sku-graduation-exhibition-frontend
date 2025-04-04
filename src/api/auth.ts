import store from "@store/store";
import api from ".";
import { IAuth } from "@interface";
import { clearAuth } from "@store/reducers/auth";

/** login API */
export const postAuth = async (userName: string, password: string): Promise<IAuth> => {
  try {
    const result = await api.post("/public/account/login", { userName, password });

    return result.data;
  } catch (error: unknown) {
    throw new Error("로그인 인증 오류");
  }
};

/** logout API */
export const getLogout = async () => {
  try {
    await api.post(`/public/account/logout`);
    store.dispatch(clearAuth());
  } catch (error: unknown) {
    throw new Error(`로그아웃 오류`);
  }
};
