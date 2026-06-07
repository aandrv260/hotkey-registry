import type { HotkeyDebug } from "./hotkey-debug.types";

export type HotkeyEnabled = boolean | (() => boolean);

export interface HotkeyConfig {
  description?: string;
  enabled?: HotkeyEnabled;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInEditable?: boolean;
  priority?: number;
  debug?: HotkeyDebug;
}

export interface ResolvedHotkeyConfig {
  description?: string;
  enabled: HotkeyEnabled;
  preventDefault: boolean;
  stopPropagation: boolean;
  allowInEditable: boolean;
  priority: number;
  debug?: HotkeyDebug;
}
