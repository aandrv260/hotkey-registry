import { afterEach, describe, expect, it, vi } from "vitest";
import type { ParsedHotkeyCombination } from "../types";
import { stubPlatform } from "../test-support";
import { doesHotkeyEventMatch } from "./matchHotkeyEvent.utils";

const keyEvent = (init: Partial<KeyboardEvent>): KeyboardEvent =>
  ({
    key: "",
    code: "",
    altKey: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    ...init,
  }) as KeyboardEvent;

const combination = (
  key: ParsedHotkeyCombination["key"],
  modifiers: ParsedHotkeyCombination["modifiers"] = [],
): ParsedHotkeyCombination => ({ key, modifiers });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("doesHotkeyEventMatch()", () => {
  it("matches a letter regardless of event case", () => {
    const event = keyEvent({ key: "a", code: "KeyA" });
    expect(doesHotkeyEventMatch(event, combination("A"))).toBe(true);
  });

  it("does not match a different key", () => {
    const event = keyEvent({ key: "b", code: "KeyB" });
    expect(doesHotkeyEventMatch(event, combination("A"))).toBe(false);
  });

  it("matches the Space alias against the spacebar", () => {
    const event = keyEvent({ key: " ", code: "Space" });
    expect(doesHotkeyEventMatch(event, combination("Space"))).toBe(true);
  });

  it("requires every expected modifier to be held", () => {
    const event = keyEvent({ key: "a", code: "KeyA", shiftKey: false });
    expect(doesHotkeyEventMatch(event, combination("A", ["Shift"]))).toBe(false);
  });

  it("rejects extra modifiers that are not part of the combination", () => {
    const event = keyEvent({ key: "a", code: "KeyA", shiftKey: true });
    expect(doesHotkeyEventMatch(event, combination("A"))).toBe(false);
  });

  it("matches Mod via Ctrl on non-Apple platforms", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "k", code: "KeyK", ctrlKey: true });
    expect(doesHotkeyEventMatch(event, combination("K", ["Mod"]))).toBe(true);
  });

  it("does not match Mod when only Meta is held on non-Apple platforms", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "k", code: "KeyK", metaKey: true });
    expect(doesHotkeyEventMatch(event, combination("K", ["Mod"]))).toBe(false);
  });

  it("rejects a bare key when Ctrl is held on non-Apple platforms", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "k", code: "KeyK", ctrlKey: true });
    expect(doesHotkeyEventMatch(event, combination("K"))).toBe(false);
  });

  it("matches Mod via Cmd on Apple platforms", () => {
    stubPlatform("apple");
    const event = keyEvent({ key: "k", code: "KeyK", metaKey: true });
    expect(doesHotkeyEventMatch(event, combination("K", ["Mod"]))).toBe(true);
  });

  it("does not match Mod when only Ctrl is held on Apple platforms", () => {
    stubPlatform("apple");
    const event = keyEvent({ key: "k", code: "KeyK", ctrlKey: true });
    expect(doesHotkeyEventMatch(event, combination("K", ["Mod"]))).toBe(false);
  });

  it("matches Option-modified letters on macOS by physical key", () => {
    stubPlatform("apple");
    const event = keyEvent({ key: "∫", code: "KeyB", altKey: true });
    expect(doesHotkeyEventMatch(event, combination("B", ["Alt"]))).toBe(true);
  });

  it("matches Alt by event.key on non-Apple platforms", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "b", code: "KeyB", altKey: true });
    expect(doesHotkeyEventMatch(event, combination("B", ["Alt"]))).toBe(true);
  });

  it("matches shifted digits by physical key", () => {
    const event = keyEvent({ key: "!", code: "Digit1", shiftKey: true });
    expect(doesHotkeyEventMatch(event, combination("1", ["Shift"]))).toBe(true);
  });

  it("matches shifted punctuation by physical key", () => {
    const event = keyEvent({ key: "?", code: "Slash", shiftKey: true });
    expect(doesHotkeyEventMatch(event, combination("/", ["Shift"]))).toBe(true);
  });
});
