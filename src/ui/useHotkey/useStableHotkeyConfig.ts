import { useMemo } from "react";
import { isObjectEmpty } from "../../utils/object.utils";
import { HOTKEY_PRIORITY } from "../../core";
import type { HotkeyDebugEventFilter, HotkeyRegistryConfig } from "../../core";
import { useStableHotkeyEnabled } from "./useStableHotkeyEnabled";

/**
 * Used to not allow re-registering the same hotkey when the config object changes. Only if the config properties change.
 */
export const useStableHotkeyConfig = ({
  allowInEditable = false,
  debug,
  debugEvents,
  description,
  enabled = true,
  preventDefault = true,
  priority = HOTKEY_PRIORITY.global,
  stopPropagation = false,
}: HotkeyRegistryConfig = {}): HotkeyRegistryConfig => {
  const stableEnabled = useStableHotkeyEnabled(enabled);

  const stableDebugEvents = useMemo<HotkeyDebugEventFilter | undefined>(() => {
    const resolvedDebugEvents: HotkeyDebugEventFilter = {};

    if (debugEvents?.failed !== undefined) {
      resolvedDebugEvents.failed = debugEvents.failed;
    }

    if (debugEvents?.ignored !== undefined) {
      resolvedDebugEvents.ignored = debugEvents.ignored;
    }

    if (debugEvents?.matched !== undefined) {
      resolvedDebugEvents.matched = debugEvents.matched;
    }

    if (debugEvents?.registered !== undefined) {
      resolvedDebugEvents.registered = debugEvents.registered;
    }

    if (debugEvents?.triggered !== undefined) {
      resolvedDebugEvents.triggered = debugEvents.triggered;
    }

    if (debugEvents?.unregistered !== undefined) {
      resolvedDebugEvents.unregistered = debugEvents.unregistered;
    }

    if (isObjectEmpty(resolvedDebugEvents)) {
      return undefined;
    }

    return resolvedDebugEvents;
  }, [
    debugEvents?.failed,
    debugEvents?.ignored,
    debugEvents?.matched,
    debugEvents?.registered,
    debugEvents?.triggered,
    debugEvents?.unregistered,
  ]);

  return useMemo(
    () => ({
      allowInEditable,
      debug,
      debugEvents: stableDebugEvents,
      description,
      enabled: stableEnabled,
      preventDefault,
      priority,
      stopPropagation,
    }),
    [
      allowInEditable,
      debug,
      description,
      preventDefault,
      priority,
      stableDebugEvents,
      stableEnabled,
      stopPropagation,
    ],
  );
};
