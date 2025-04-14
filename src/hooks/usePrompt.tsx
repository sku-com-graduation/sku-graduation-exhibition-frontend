import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export const usePrompt = (when: boolean) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return when && currentLocation.pathname !== nextLocation.pathname;
  });

  useEffect(() => {
    if (!when) return;
    if (blocker.state !== "blocked") return;

    if (window.confirm("수정된 사항이 있습니다. 저장하지 않고 이동하시겠습니까?")) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker.state]);
};
