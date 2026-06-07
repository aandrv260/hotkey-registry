import { useContextBase } from "./useContextBase";
import { HotkeyContext } from "./HotkeyContext";

export const useHotkeyRegistry = () => {
  const { registry } = useContextBase(
    HotkeyContext,
    "useHotkeyRegistry must be used within HotkeyProvider",
  );

  return registry;
};
