export type HotkeyModifier = "Mod" | "Shift" | "Alt";

export type HotkeyModifierCombination =
  | "Mod"
  | "Shift"
  | "Alt"
  | "Mod + Shift"
  | "Mod + Alt"
  | "Shift + Alt"
  | "Mod + Shift + Alt";

type HotkeyLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type HotkeyDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type HotkeyPunctuation =
  | ","
  | "."
  | "/"
  | ";"
  | "'"
  | "["
  | "]"
  | "\\"
  | "-"
  | "="
  | "`"
  | " ";

type HotkeyNamedKey =
  | "CapsLock"
  | "Clear"
  | "ContextMenu"
  | "Escape"
  | "Enter"
  | "Tab"
  | "Backspace"
  | "Delete"
  | "NumLock"
  | "Pause"
  | "PrintScreen"
  | "ScrollLock"
  | "Space"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "Insert";

type HotkeyFunctionKey =
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12";

export type HotkeyKey =
  | HotkeyLetter
  | HotkeyDigit
  | HotkeyPunctuation
  | HotkeyNamedKey
  | HotkeyFunctionKey;

export type HotkeyCombination =
  | HotkeyKey
  | `${HotkeyModifierCombination} + ${HotkeyKey}`;
