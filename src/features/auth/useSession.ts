import { useDispatch, useSelector } from "react-redux";
import { getLogout } from "@api/auth";
import { clearAuth } from "@store/reducers/auth";
import type { RootState } from "@store/store";

/** 로그인 상태. 실제 권한 검사는 서버가 하고, 여기 값은 화면 노출 여부에만 쓴다. */
export const useSession = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const isLoggedIn = !!auth.teamName || !!auth.role;
  const isAdmin = auth.role === "ADMIN";

  const logout = async () => {
    try {
      await getLogout();
    } finally {
      dispatch(clearAuth());
    }
  };

  return { auth, isLoggedIn, isAdmin, logout };
};
