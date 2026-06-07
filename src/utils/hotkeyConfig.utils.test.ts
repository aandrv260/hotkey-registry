import { describe, expect, it } from "vitest";
import { isHotkeyEnabled, resolveHotkeyConfig } from "./hotkeyConfig.utils";

describe("resolveHotkeyConfig()", () => {
  it("applies the documented defaults for an empty config", () => {
    expect(resolveHotkeyConfig()).toEqual({
      enabled: true,
      preventDefault: true,
      stopPropagation: false,
      allowInEditable: false,
      priority: 0,
      debug: undefined,
      description: undefined,
    });
  });

  it("preserves explicitly provided values", () => {
    const noop = () => {};
    expect(
      resolveHotkeyConfig({
        enabled: false,
        preventDefault: false,
        stopPropagation: true,
        allowInEditable: true,
        priority: 42,
        description: "Save",
        debug: noop,
      }),
    ).toEqual({
      enabled: false,
      preventDefault: false,
      stopPropagation: true,
      allowInEditable: true,
      priority: 42,
      description: "Save",
      debug: noop,
    });
  });
});

describe("isHotkeyEnabled()", () => {
  it("returns boolean values directly", () => {
    expect(isHotkeyEnabled(true)).toBe(true);
    expect(isHotkeyEnabled(false)).toBe(false);
  });

  it("evaluates a predicate every time it is called", () => {
    let enabled = false;
    const predicate = () => enabled;

    expect(isHotkeyEnabled(predicate)).toBe(false);
    enabled = true;
    expect(isHotkeyEnabled(predicate)).toBe(true);
  });
});
