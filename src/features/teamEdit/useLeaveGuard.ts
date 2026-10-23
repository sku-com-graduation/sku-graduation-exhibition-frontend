import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

const MESSAGE = "수정된 사항이 있습니다. 저장하지 않고 이동하시겠습니까?";

/**
 * 저장하지 않은 변경이 있을 때 다른 화면으로 가거나 탭을 닫으면 확인을 받는다.
 * 저장 직후처럼 확인 없이 떠나야 할 때는 돌려준 allowLeave()를 먼저 부른다.
 */
export const useLeaveGuard = (dirty: boolean) => {
  const skip = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !skip.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm(MESSAGE)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (skip.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return () => {
    skip.current = true;
  };
};
