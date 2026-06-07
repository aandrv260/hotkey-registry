import type { HotkeyCombination, HotkeyModifier } from "./hotkey-combination.types";

export type HotkeyDebugEventType =
  | "registered"
  | "unregistered"
  | "ignored"
  | "matched"
  | "triggered"
  | "failed";

export type HotkeyDebug = (event: HotkeyDebugEvent) => void;

export interface HotkeyDebugEvent {
  type: HotkeyDebugEventType;
  keyCombination: HotkeyCombination;
  description?: string;
  priority: number;
  reason?: string;
  key?: string;
  code?: string;
  error?: unknown;
  modifiers: readonly HotkeyModifier[];
}
