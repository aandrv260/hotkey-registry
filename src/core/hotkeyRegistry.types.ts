import type {
  HotkeyCombination,
  ParsedHotkeyCombination,
  ResolvedHotkeyConfig,
} from "../types";
import type { HotkeyRegistryConfig } from "./HotkeyDebugger.types";

export type HotkeyBindingId = string;

export type HotkeyRegistryEventListener = (event: KeyboardEvent) => void;

export interface HotkeyRegistryEventSource {
  addEventListener: (type: "keydown", listener: HotkeyRegistryEventListener) => void;

  removeEventListener: (
    type: "keydown",
    listener: HotkeyRegistryEventListener,
  ) => void;
}

export interface HotkeyRegistrationHandle {
  id: HotkeyBindingId;
  unregister: () => void;
}

export interface RegisteredHotkeyBinding {
  id: HotkeyBindingId;
  keyCombination: HotkeyCombination;
  onTrigger: (event: KeyboardEvent) => void;
  config: ResolvedHotkeyConfig;
  registryConfig?: HotkeyRegistryConfig;
  parsedHotkeyCombination: ParsedHotkeyCombination;
  combinationKey: string;
  registrationOrder: number;
}
