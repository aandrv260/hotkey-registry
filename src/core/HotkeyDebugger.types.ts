import type {
  HotkeyCombination,
  HotkeyConfig,
  HotkeyDebug,
  ParsedHotkeyCombination,
  HotkeyDebugEventType,
  ResolvedHotkeyConfig,
} from "../types";

export type HotkeyDebugEventFilter = Partial<Record<HotkeyDebugEventType, boolean>>;

export interface HotkeyRegistryOptions {
  debug?: HotkeyDebug;
  debugEvents?: HotkeyDebugEventFilter;
}

export interface HotkeyRegistryConfig extends HotkeyConfig {
  debugEvents?: HotkeyDebugEventFilter;
}

export interface EmitParams {
  type: HotkeyDebugEventType;
  keyCombination: HotkeyCombination;
  config: ResolvedHotkeyConfig;
  registryConfig?: HotkeyRegistryConfig;
  parsedHotkeyCombination: ParsedHotkeyCombination;
  keyboardEvent?: KeyboardEvent;
  reason?: string;
  error?: unknown;
}
