import type { HotkeyModifier, ParsedHotkeyCombination } from "../types";
import { isApplePlatform } from "./hotkeyPlatform.utils";

export const normalizeHotkeyKey = (key: string): string => {
  if (key === "Space") {
    return " ";
  }

  if (key.length === 1) {
    return key.toLowerCase();
  }

  return key;
};

export const hasHotkeyModifier = (
  modifiers: readonly HotkeyModifier[],
  modifier: HotkeyModifier,
): boolean => {
  return modifiers.includes(modifier);
};

const HOTKEY_CODE_TO_KEY: Partial<Record<KeyboardEvent["code"], string>> = {
  Backquote: "`",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Comma: ",",
  Digit0: "0",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Equal: "=",
  KeyA: "a",
  KeyB: "b",
  KeyC: "c",
  KeyD: "d",
  KeyE: "e",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyI: "i",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  KeyM: "m",
  KeyN: "n",
  KeyO: "o",
  KeyP: "p",
  KeyQ: "q",
  KeyR: "r",
  KeyS: "s",
  KeyT: "t",
  KeyU: "u",
  KeyV: "v",
  KeyW: "w",
  KeyX: "x",
  KeyY: "y",
  KeyZ: "z",
  Minus: "-",
  Period: ".",
  Quote: "'",
  Semicolon: ";",
  Slash: "/",
  Space: " ",
};

export const getNormalizedActualHotkeyKey = (
  event: KeyboardEvent,
  expectsShift: boolean,
  expectsAlt: boolean,
): string => {
  if (
    !(expectsShift && event.shiftKey) &&
    !(expectsAlt && isApplePlatform() && event.altKey)
  ) {
    return normalizeHotkeyKey(event.key);
  }

  const normalizedCodeKey = HOTKEY_CODE_TO_KEY[event.code];

  if (!normalizedCodeKey) {
    return normalizeHotkeyKey(event.key);
  }

  return normalizeHotkeyKey(normalizedCodeKey);
};

export const getParsedHotkeyCombinationKey = (
  parsedHotkeyCombination: ParsedHotkeyCombination,
): string => {
  const modifiers = [...parsedHotkeyCombination.modifiers].sort();
  const normalizedKey = normalizeHotkeyKey(parsedHotkeyCombination.key);

  return [...modifiers, normalizedKey].join("+");
};

export const getHotkeyEventCombinationKey = (event: KeyboardEvent): string => {
  const modifiers: HotkeyModifier[] = [];

  if (event.metaKey || event.ctrlKey) {
    modifiers.push("Mod");
  }

  if (event.shiftKey) {
    modifiers.push("Shift");
  }

  if (event.altKey) {
    modifiers.push("Alt");
  }

  const normalizedKey = getNormalizedActualHotkeyKey(
    event,
    event.shiftKey,
    event.altKey,
  );

  return [...modifiers.sort(), normalizedKey].join("+");
};
