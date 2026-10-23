import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useSession } from "@src/features/auth/useSession";

/** 화면 노출만 막는다. 실제 권한은 서버가 검증한다. */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useSession();
  const { year } = useParams();
  return isAdmin ? children : <Navigate to={`/${year}`} replace />;
};

export const RequireTeamOrAdmin = ({ children }: { children: ReactNode }) => {
  const { auth, isAdmin } = useSession();
  const { year, team_uuid } = useParams();
  return isAdmin || (!!team_uuid && auth.uuid === team_uuid) ? children : <Navigate to={`/${year}/project/${team_uuid}`} replace />;
};
