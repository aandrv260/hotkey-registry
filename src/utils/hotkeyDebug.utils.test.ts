import { describe, expect, it } from "vitest";
import type { ParsedHotkeyCombination } from "../types";
import { resolveHotkeyConfig } from "./hotkeyConfig.utils";
import { createHotkeyDebugEvent } from "./hotkeyDebug.utils";

describe("createHotkeyDebugEvent()", () => {
  const parsed: ParsedHotkeyCombination = { key: "K", modifiers: ["Mod", "Shift"] };

  it("carries the description and priority from the resolved config", () => {
    const event = createHotkeyDebugEvent({
      type: "triggered",
      keyCombination: "Mod + Shift + K",
      config: resolveHotkeyConfig({ description: "Do thing", priority: 7 }),
      parsedHotkeyCombination: parsed,
    });

    expect(event).toMatchObject({
      type: "triggered",
      keyCombination: "Mod + Shift + K",
      description: "Do thing",
      priority: 7,
      modifiers: ["Mod", "Shift"],
    });
  });

  it("includes the key, code, reason and error when present", () => {
    const error = new Error("nope");
    const event = createHotkeyDebugEvent({
      type: "failed",
      keyCombination: "Mod + Shift + K",
      config: resolveHotkeyConfig(),
      parsedHotkeyCombination: parsed,
      keyboardEvent: { key: "k", code: "KeyK" } as KeyboardEvent,
      reason: "boom",
      error,
    });

    expect(event).toMatchObject({
      key: "k",
      code: "KeyK",
      reason: "boom",
      error,
    });
  });

  it("defaults modifiers to an empty list when no parsed combination is given", () => {
    const event = createHotkeyDebugEvent({
      type: "ignored",
      keyCombination: "K",
      config: resolveHotkeyConfig(),
      parsedHotkeyCombination: null,
    });

    expect(event.modifiers).toEqual([]);
  });
});
