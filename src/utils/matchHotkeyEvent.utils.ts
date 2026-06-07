import type { ParsedHotkeyCombination } from "../types";
import { systemModifiersMatchExpected } from "./hotkeyPlatform.utils";
import {
  getNormalizedActualHotkeyKey,
  hasHotkeyModifier,
  normalizeHotkeyKey,
} from "./hotkeyKeyNormalization.utils";

export const doesHotkeyEventMatch = (
  event: KeyboardEvent,
  parsedHotkeyCombination: ParsedHotkeyCombination,
): boolean => {
  const expectsMod = hasHotkeyModifier(parsedHotkeyCombination.modifiers, "Mod");
  const expectsShift = hasHotkeyModifier(parsedHotkeyCombination.modifiers, "Shift");
  const expectsAlt = hasHotkeyModifier(parsedHotkeyCombination.modifiers, "Alt");

  const expectedKey = normalizeHotkeyKey(parsedHotkeyCombination.key);
  const actualKey = getNormalizedActualHotkeyKey(event, expectsShift, expectsAlt);

  if (expectedKey !== actualKey) {
    return false;
  }

  return (
    systemModifiersMatchExpected(event, expectsMod) &&
    event.shiftKey === expectsShift &&
    event.altKey === expectsAlt
  );
};
