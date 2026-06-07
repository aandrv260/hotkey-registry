import { useEffect, useMemo, type ReactNode } from "react";
import type { HotkeyRegistry } from "../core";
import { HotkeyContext } from "./HotkeyContext";

interface Props {
  children: ReactNode;
  registry: HotkeyRegistry;
}

export default function HotkeyProvider({ children, registry }: Props) {
  const value = useMemo(() => ({ registry }), [registry]);

  useEffect(() => {
    registry.init();
    return () => registry.cleanup();
  }, [registry]);

  return <HotkeyContext value={value}>{children}</HotkeyContext>;
}

export type { Props as HotkeyProviderProps };
