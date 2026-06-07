import type { HotkeyDebug, HotkeyDebugEventType } from "../types";
import { createHotkeyDebugEvent } from "../utils/hotkeyDebug.utils";
import type {
  EmitParams,
  HotkeyRegistryConfig,
  HotkeyRegistryOptions,
} from "./HotkeyDebugger.types";

const DEFAULT_HOTKEY_DEBUG_EVENTS = {
  registered: false,
  unregistered: false,
  ignored: false,
  matched: false,
  triggered: true,
  failed: true,
} as const satisfies Record<HotkeyDebugEventType, boolean>;

/**
 * Resolves registry and per-hotkey debug settings before emitting events.
 * It keeps filtering and event creation out of registry storage and dispatch logic.
 */
export default class HotkeyDebugger {
  public constructor(private readonly options?: HotkeyRegistryOptions) {}

  public emit({
    type,
    keyCombination,
    config,
    registryConfig,
    parsedHotkeyCombination,
    keyboardEvent,
    reason,
    error,
  }: EmitParams) {
    const debug = this.resolveDebug(registryConfig);

    if (!debug) {
      return;
    }

    const debugEvents = this.resolveDebugEvents(registryConfig);

    if (!debugEvents[type]) {
      return;
    }

    debug(
      createHotkeyDebugEvent({
        type,
        keyCombination,
        config,
        parsedHotkeyCombination,
        keyboardEvent,
        reason,
        error,
      }),
    );
  }

  private resolveDebug(
    registryConfig?: HotkeyRegistryConfig,
  ): HotkeyDebug | undefined {
    return registryConfig?.debug ?? this.options?.debug;
  }

  private resolveDebugEvents(
    registryConfig?: HotkeyRegistryConfig,
  ): Required<Record<HotkeyDebugEventType, boolean>> {
    return {
      ...DEFAULT_HOTKEY_DEBUG_EVENTS,
      ...this.options?.debugEvents,
      ...registryConfig?.debugEvents,
    };
  }
}
