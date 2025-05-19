import { useState, useCallback } from "react";

export const useSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0); // ✅ 진행률 상태 추가

  const loadingStart = useCallback(() => {
    setIsLoading(true);
    setProgress(0); // 시작 시 진행률 초기화
  }, []);

  const loadingStop = useCallback(() => {
    setIsLoading(false);
    setProgress(0); // 완료 후 초기화
  }, []);

  return {
    isLoading,
    setIsLoading,
    loadingStart,
    loadingStop,
    progress,
    setProgress, // ✅ 퍼센트 갱신용
  };
};

// import { useState, useCallback } from "react";

// export const useSpinner = () => {
//   const [isLoading, setIsLoading] = useState(false);

//   const loadingStart = useCallback(() => setIsLoading(true), []);
//   const loadingStop = useCallback(() => setIsLoading(false), []);

//   return { isLoading, setIsLoading, loadingStart, loadingStop };
// };
