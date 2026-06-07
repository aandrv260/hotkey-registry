import { afterEach, describe, expect, it, vi } from "vitest";
import { stubPlatform } from "../test-support";
import {
  isApplePlatform,
  isModKeyPressed,
  systemModifiersMatchExpected,
} from "./hotkeyPlatform.utils";

const keyEvent = (init: Partial<KeyboardEvent>): KeyboardEvent =>
  ({ altKey: false, shiftKey: false, ctrlKey: false, metaKey: false, ...init }) as
    KeyboardEvent;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isApplePlatform()", () => {
  it("detects Apple platforms from the user agent", () => {
    stubPlatform("apple");
    expect(isApplePlatform()).toBe(true);
  });

  it("returns false for non-Apple platforms", () => {
    stubPlatform("other");
    expect(isApplePlatform()).toBe(false);
  });
});

describe("isModKeyPressed()", () => {
  it("is Cmd (Meta) on Apple platforms", () => {
    stubPlatform("apple");
    expect(isModKeyPressed(keyEvent({ metaKey: true }))).toBe(true);
    expect(isModKeyPressed(keyEvent({ ctrlKey: true }))).toBe(false);
  });

  it("is Ctrl on non-Apple platforms", () => {
    stubPlatform("other");
    expect(isModKeyPressed(keyEvent({ ctrlKey: true }))).toBe(true);
    expect(isModKeyPressed(keyEvent({ metaKey: true }))).toBe(false);
  });
});

describe("systemModifiersMatchExpected()", () => {
  it("accepts an event with neither Ctrl nor Meta when no Mod is expected", () => {
    expect(systemModifiersMatchExpected(keyEvent({}), false)).toBe(true);
  });

  it("rejects any held Ctrl or Meta when no Mod is expected", () => {
    expect(systemModifiersMatchExpected(keyEvent({ ctrlKey: true }), false)).toBe(
      false,
    );
    expect(systemModifiersMatchExpected(keyEvent({ metaKey: true }), false)).toBe(
      false,
    );
  });

  it("requires Cmd and rejects the opposite system modifier when Mod is expected on Apple", () => {
    stubPlatform("apple");
    expect(systemModifiersMatchExpected(keyEvent({ metaKey: true }), true)).toBe(true);
    expect(systemModifiersMatchExpected(keyEvent({ ctrlKey: true }), true)).toBe(false);
    expect(
      systemModifiersMatchExpected(keyEvent({ metaKey: true, ctrlKey: true }), true),
    ).toBe(false);
  });

  it("requires Ctrl and rejects Meta when Mod is expected on non-Apple", () => {
    stubPlatform("other");
    expect(systemModifiersMatchExpected(keyEvent({ ctrlKey: true }), true)).toBe(true);
    expect(systemModifiersMatchExpected(keyEvent({ metaKey: true }), true)).toBe(false);
  });
});
