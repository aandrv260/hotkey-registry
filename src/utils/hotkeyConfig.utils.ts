import type { HotkeyConfig, HotkeyEnabled, ResolvedHotkeyConfig } from "../types";

export const resolveHotkeyConfig = (
  config: HotkeyConfig = {},
): ResolvedHotkeyConfig => {
  return {
    enabled: config.enabled ?? true,
    preventDefault: config.preventDefault ?? true,
    stopPropagation: config.stopPropagation ?? false,
    allowInEditable: config.allowInEditable ?? false,
    priority: config.priority ?? 0,
    debug: config.debug,
    description: config.description,
  };
};

export const isHotkeyEnabled = (enabled: HotkeyEnabled) => {
  if (typeof enabled === "function") {
    return enabled();
  }

  return enabled;
};
