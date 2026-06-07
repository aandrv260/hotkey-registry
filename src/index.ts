export { HotkeyProvider, useHotkeyRegistry, useHotkey } from "./ui";
export type { HotkeyProviderProps } from "./ui";

export { HotkeyDebugger, HotkeyRegistry, HOTKEY_PRIORITY } from "./core";

export type {
  HotkeyBindingId,
  HotkeyDebugEventFilter,
  HotkeyRegistryConfig,
  HotkeyRegistryEventListener,
  HotkeyRegistryEventSource,
  HotkeyRegistrationHandle,
  HotkeyRegistryOptions,
} from "./core";

export type {
  HotkeyCombination,
  HotkeyConfig,
  HotkeyDebug,
  HotkeyDebugEvent,
  HotkeyDebugEventType,
  HotkeyKey,
  HotkeyModifier,
  HotkeyModifierCombination,
} from "./types";
