import { useRouteError } from "react-router-dom";
import NotFound from "@src/pages/NotFound";

const RELOAD_KEY = "reloaded-for-deploy";

/** 브라우저마다 다른, 화면 조각 파일을 받지 못했을 때의 오류 문구 */
const isChunkError = (error: unknown) =>
  error instanceof Error &&
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(error.message);

/**
 * 새로 배포하면 이전 빌드의 화면 조각 파일이 사라진다. 배포 전에 열어 둔 탭이 그 파일을 찾지 못하면
 * 가려던 주소 그대로 새로고침해 새 빌드를 받는다. 계속 실패하면 반복하지 않도록 10초 안에는 다시 하지 않는다.
 */
const RouteError = () => {
  const error = useRouteError();
  if (isChunkError(error)) {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY));
      if (Date.now() - last > 10_000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
        return null;
      }
    } catch {
      // 저장소를 쓸 수 없으면 새로고침 없이 아래 화면을 보여준다
    }
    return <NotFound code="오류" message="화면을 불러오지 못했습니다. 잠시 후 새로고침해 주세요." />;
  }
  return <NotFound />;
};

export default RouteError;
