import { useState, useCallback } from "react";

export const useSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadingStart = useCallback(() => setIsLoading(true), []);
  const loadingStop = useCallback(() => setIsLoading(false), []);

  return { isLoading, setIsLoading, loadingStart, loadingStop };
};
