import { useCallback, useRef } from "react";
import type { HotkeyEnabled } from "../../types";

export const useStableHotkeyEnabled = (enabled: HotkeyEnabled): HotkeyEnabled => {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const stableEnabled = useCallback(() => {
    const currentEnabled = enabledRef.current;

    if (typeof currentEnabled === "function") {
      return currentEnabled();
    }

    return currentEnabled;
  }, []);

  if (typeof enabled !== "function") {
    return enabled;
  }

  return stableEnabled;
};
