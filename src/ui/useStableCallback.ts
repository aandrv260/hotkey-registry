import { useCallback, useRef } from "react";

/**
 * Keeps a callback with stable reference across re-renders.
 */
export const useStableCallback = <TArgs extends unknown[], TReturnValue>(
  callback: (...args: TArgs) => TReturnValue,
) => {
  const stableFn = useRef(callback);
  stableFn.current = callback;

  return useCallback((...args: TArgs): TReturnValue => {
    return stableFn.current(...args);
  }, []);
};
