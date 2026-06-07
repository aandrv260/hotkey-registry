import type {
  HotkeyCombination,
  HotkeyModifier,
  ParsedHotkeyCombination,
} from "../types";

const HOTKEY_SEPARATOR = " + ";
const SUPPORTED_MODIFIERS: readonly HotkeyModifier[] = ["Mod", "Shift", "Alt"];
const UNSUPPORTED_MODIFIERS = new Set(["Meta", "Ctrl", "Control", "Cmd", "Command"]);

const isSupportedModifier = (value: string): value is HotkeyModifier => {
  return SUPPORTED_MODIFIERS.includes(value as HotkeyModifier);
};

const createInvalidHotkeyCombinationError = (
  keyCombination: string,
  reason: string,
) => {
  return new Error(`Invalid hotkey combination "${keyCombination}": ${reason}`);
};

const handleInvalidHotkeyCombination = (
  keyCombination: string,
  reason: string,
): null => {
  if (import.meta.env.DEV) {
    throw createInvalidHotkeyCombinationError(keyCombination, reason);
  }

  return null;
};

export const parseHotkeyCombination = (
  keyCombination: HotkeyCombination,
): ParsedHotkeyCombination | null => {
  if (keyCombination.includes("+") && !keyCombination.includes(HOTKEY_SEPARATOR)) {
    return handleInvalidHotkeyCombination(
      keyCombination,
      `use "${HOTKEY_SEPARATOR}" between modifiers and key`,
    );
  }

  const segments = keyCombination.split(HOTKEY_SEPARATOR);

  if (segments.some(segment => segment === "")) {
    return handleInvalidHotkeyCombination(
      keyCombination,
      "empty segments are not allowed",
    );
  }

  const key = segments.at(-1);

  if (!key) {
    return handleInvalidHotkeyCombination(keyCombination, "missing key");
  }

  if (isSupportedModifier(key)) {
    return handleInvalidHotkeyCombination(
      keyCombination,
      "modifier-only combinations are not allowed",
    );
  }

  if (UNSUPPORTED_MODIFIERS.has(key)) {
    return handleInvalidHotkeyCombination(
      keyCombination,
      `use "Mod" instead of "${key}"`,
    );
  }

  const modifiers = segments.slice(0, -1);
  const parsedModifiers: HotkeyModifier[] = [];
  const uniqueModifiers = new Set<string>();

  for (const modifier of modifiers) {
    if (UNSUPPORTED_MODIFIERS.has(modifier)) {
      return handleInvalidHotkeyCombination(
        keyCombination,
        `use "Mod" instead of "${modifier}"`,
      );
    }

    if (!isSupportedModifier(modifier)) {
      return handleInvalidHotkeyCombination(
        keyCombination,
        `"${modifier}" is not a supported modifier`,
      );
    }

    if (uniqueModifiers.has(modifier)) {
      return handleInvalidHotkeyCombination(
        keyCombination,
        `"${modifier}" cannot be repeated`,
      );
    }

    uniqueModifiers.add(modifier);
    parsedModifiers.push(modifier);
  }

  return {
    key: key as ParsedHotkeyCombination["key"],
    modifiers: parsedModifiers,
  };
};
