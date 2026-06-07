import type {
  HotkeyCombination,
  HotkeyDebugEvent,
  HotkeyDebugEventType,
  ParsedHotkeyCombination,
  ResolvedHotkeyConfig,
} from "../types";

interface CreateHotkeyDebugEventParams {
  type: HotkeyDebugEventType;
  keyCombination: HotkeyCombination;
  config: ResolvedHotkeyConfig;
  parsedHotkeyCombination?: ParsedHotkeyCombination | null;
  keyboardEvent?: KeyboardEvent;
  reason?: string;
  error?: unknown;
}

export const createHotkeyDebugEvent = ({
  type,
  keyCombination,
  config,
  parsedHotkeyCombination,
  keyboardEvent,
  reason,
  error,
}: CreateHotkeyDebugEventParams): HotkeyDebugEvent => {
  return {
    type,
    keyCombination,
    description: config.description,
    priority: config.priority,
    reason,
    key: keyboardEvent?.key,
    code: keyboardEvent?.code,
    error,
    modifiers: parsedHotkeyCombination?.modifiers ?? [],
  };
};
