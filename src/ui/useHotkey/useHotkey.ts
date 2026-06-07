import { useEffect } from "react";
import type { HotkeyCombination } from "../../types";
import type { HotkeyRegistryConfig } from "../../core";
import { useStableCallback } from "../useStableCallback";
import { useHotkeyRegistry } from "../useHotkeyRegistry";
import { useStableHotkeyConfig } from "./useStableHotkeyConfig";

// TODO: Add combinations of multiple keys like in VS Code. For instance `S K`, `A B`, etc. With or without Mod in the beginning.
export const useHotkey = (
  keyCombination: HotkeyCombination,
  onTrigger: (event: KeyboardEvent) => void,
  config?: HotkeyRegistryConfig,
) => {
  const registry = useHotkeyRegistry();
  const stableOnTrigger = useStableCallback(onTrigger);
  const stableConfig = useStableHotkeyConfig(config);

  useEffect(() => {
    const unregister = registry.register(
      keyCombination,
      stableOnTrigger,
      stableConfig,
    );

    return () => unregister();
  }, [keyCombination, registry, stableConfig, stableOnTrigger]);
};
