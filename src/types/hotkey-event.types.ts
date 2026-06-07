import type { HotkeyKey, HotkeyModifier } from "./hotkey-combination.types";

export interface ParsedHotkeyCombination {
  key: HotkeyKey;
  modifiers: readonly HotkeyModifier[];
}

export interface HotkeyModifierState {
  mod: boolean;
  shift: boolean;
  alt: boolean;
}
