import { createContext } from "react";
import type { HotkeyRegistry } from "../core";

export interface HotkeyContextValue {
  registry: HotkeyRegistry;
}

export const HotkeyContext = createContext<HotkeyContextValue | undefined>(
  undefined,
);
