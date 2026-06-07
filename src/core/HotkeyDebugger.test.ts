import { describe, expect, it, vi } from "vitest";
import type { HotkeyDebugEventType } from "../types";
import { resolveHotkeyConfig } from "../utils/hotkeyConfig.utils";
import HotkeyDebugger from "./HotkeyDebugger";
import type { HotkeyRegistryConfig } from "./HotkeyDebugger.types";

const emit = (
  hotkeyDebugger: HotkeyDebugger,
  type: HotkeyDebugEventType,
  registryConfig?: HotkeyRegistryConfig,
) =>
  hotkeyDebugger.emit({
    type,
    keyCombination: "Mod + K",
    config: resolveHotkeyConfig({ description: "Demo", priority: 3 }),
    parsedHotkeyCombination: { key: "K", modifiers: ["Mod"] },
    registryConfig,
  });

describe("HotkeyDebugger", () => {
  it("does nothing when no debug callback is resolvable", () => {
    expect(() => emit(new HotkeyDebugger(), "triggered")).not.toThrow();
  });

  it("emits triggered and failed by default", () => {
    const debug = vi.fn();

    emit(new HotkeyDebugger({ debug }), "triggered");
    emit(new HotkeyDebugger({ debug }), "failed");

    expect(debug).toHaveBeenCalledTimes(2);
  });

  it.each<HotkeyDebugEventType>([
    "registered",
    "unregistered",
    "ignored",
    "matched",
  ])("suppresses %s by default", type => {
    const debug = vi.fn();

    emit(new HotkeyDebugger({ debug }), type);

    expect(debug).not.toHaveBeenCalled();
  });

  it("emits a normally-suppressed type when enabled via registry options", () => {
    const debug = vi.fn();

    emit(new HotkeyDebugger({ debug, debugEvents: { registered: true } }), "registered");

    expect(debug).toHaveBeenCalledTimes(1);
  });

  it("lets a per-binding filter override the registry option", () => {
    const debug = vi.fn();

    // triggered is on by default; the binding turns it off for itself.
    emit(new HotkeyDebugger({ debug }), "triggered", {
      debugEvents: { triggered: false },
    });

    expect(debug).not.toHaveBeenCalled();
  });

  it("uses the registry options callback when the binding has none", () => {
    const optionsDebug = vi.fn();

    emit(new HotkeyDebugger({ debug: optionsDebug }), "triggered");

    expect(optionsDebug).toHaveBeenCalledTimes(1);
  });

  it("prefers the per-binding callback over the registry one", () => {
    const optionsDebug = vi.fn();
    const bindingDebug = vi.fn();

    emit(new HotkeyDebugger({ debug: optionsDebug }), "triggered", {
      debug: bindingDebug,
    });

    expect(bindingDebug).toHaveBeenCalledTimes(1);
    expect(optionsDebug).not.toHaveBeenCalled();
  });

  it("emits a fully built debug event", () => {
    const debug = vi.fn();

    emit(new HotkeyDebugger({ debug }), "triggered");

    expect(debug).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "triggered",
        keyCombination: "Mod + K",
        description: "Demo",
        priority: 3,
        modifiers: ["Mod"],
      }),
    );
  });
});
