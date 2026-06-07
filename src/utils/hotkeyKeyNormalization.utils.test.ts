import { afterEach, describe, expect, it, vi } from "vitest";
import { stubPlatform } from "../test-support";
import {
  getHotkeyEventCombinationKey,
  getNormalizedActualHotkeyKey,
  getParsedHotkeyCombinationKey,
  hasHotkeyModifier,
  normalizeHotkeyKey,
} from "./hotkeyKeyNormalization.utils";

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeHotkeyKey()", () => {
  it("maps the Space alias to a literal space", () => {
    expect(normalizeHotkeyKey("Space")).toBe(" ");
  });

  it("lowercases single characters so case never matters", () => {
    expect(normalizeHotkeyKey("A")).toBe("a");
    expect(normalizeHotkeyKey("a")).toBe("a");
  });

  it("leaves multi-character named keys untouched", () => {
    expect(normalizeHotkeyKey("Enter")).toBe("Enter");
    expect(normalizeHotkeyKey("ArrowUp")).toBe("ArrowUp");
  });
});

describe("hasHotkeyModifier()", () => {
  it("reports whether a modifier is present", () => {
    expect(hasHotkeyModifier(["Mod", "Shift"], "Shift")).toBe(true);
    expect(hasHotkeyModifier(["Mod"], "Alt")).toBe(false);
  });
});

describe("getParsedHotkeyCombinationKey()", () => {
  it("produces a stable key independent of modifier order", () => {
    const a = getParsedHotkeyCombinationKey({ key: "P", modifiers: ["Shift", "Mod"] });
    const b = getParsedHotkeyCombinationKey({ key: "P", modifiers: ["Mod", "Shift"] });
    expect(a).toBe(b);
  });

  it("normalizes the key inside the produced key", () => {
    expect(getParsedHotkeyCombinationKey({ key: "K", modifiers: ["Mod"] })).toBe(
      "Mod+k",
    );
  });
});

describe("getHotkeyEventCombinationKey()", () => {
  it("derives the same key an equivalent parsed combination would produce", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "k", code: "KeyK", ctrlKey: true });
    expect(getHotkeyEventCombinationKey(event)).toBe(
      getParsedHotkeyCombinationKey({ key: "K", modifiers: ["Mod"] }),
    );
  });

  it("treats Ctrl and Meta both as Mod", () => {
    const withCtrl = getHotkeyEventCombinationKey(
      keyEvent({ key: "k", code: "KeyK", ctrlKey: true }),
    );
    const withMeta = getHotkeyEventCombinationKey(
      keyEvent({ key: "k", code: "KeyK", metaKey: true }),
    );
    expect(withCtrl).toBe(withMeta);
  });

  it("indexes shifted physical keys by their unshifted character", () => {
    const event = keyEvent({ key: "!", code: "Digit1", shiftKey: true });
    expect(getHotkeyEventCombinationKey(event)).toBe("Shift+1");
  });
});

describe("getNormalizedActualHotkeyKey()", () => {
  it("uses the physical code for Option-modified keys on macOS", () => {
    stubPlatform("apple");
    const event = keyEvent({ key: "∫", code: "KeyB", altKey: true });
    expect(getNormalizedActualHotkeyKey(event, false, true)).toBe("b");
  });

  it("uses event.key for Alt on non-Apple platforms", () => {
    stubPlatform("other");
    const event = keyEvent({ key: "b", code: "KeyB", altKey: true });
    expect(getNormalizedActualHotkeyKey(event, false, true)).toBe("b");
  });
});
