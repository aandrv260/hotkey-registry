import { describe, expect, it } from "vitest";
import type { HotkeyCombination } from "../types";
import { parseHotkeyCombination } from "./parseHotkeyCombination.utils";

describe("parseHotkeyCombination()", () => {
  it("parses a bare key with no modifiers", () => {
    expect(parseHotkeyCombination("K")).toEqual({ key: "K", modifiers: [] });
  });

  it("parses a single-modifier combination", () => {
    expect(parseHotkeyCombination("Mod + K")).toEqual({
      key: "K",
      modifiers: ["Mod"],
    });
  });

  it("parses a multi-modifier combination", () => {
    expect(parseHotkeyCombination("Mod + Shift + P")).toEqual({
      key: "P",
      modifiers: ["Mod", "Shift"],
    });
  });

  it("preserves the written order of modifiers", () => {
    // The HotkeyCombination type only permits canonical ordering; the parser
    // itself preserves whatever order it is handed, which we assert via a cast.
    expect(parseHotkeyCombination("Alt + Shift + A" as HotkeyCombination)).toEqual({
      key: "A",
      modifiers: ["Alt", "Shift"],
    });
  });

  it("accepts named keys", () => {
    expect(parseHotkeyCombination("Escape")).toEqual({
      key: "Escape",
      modifiers: [],
    });
  });

  it("accepts punctuation keys", () => {
    expect(parseHotkeyCombination("Shift + /")).toEqual({
      key: "/",
      modifiers: ["Shift"],
    });
  });

  it("rejects a missing ' + ' separator", () => {
    expect(() => parseHotkeyCombination("Mod+K" as HotkeyCombination)).toThrow();
  });

  it("rejects empty segments", () => {
    expect(() => parseHotkeyCombination("Shift + " as HotkeyCombination)).toThrow();
  });

  it("rejects a modifier-only combination", () => {
    expect(() => parseHotkeyCombination("Mod" as HotkeyCombination)).toThrow();
  });

  it("rejects repeated modifiers", () => {
    expect(() =>
      parseHotkeyCombination("Mod + Mod + K" as HotkeyCombination),
    ).toThrow();
  });

  it("rejects an unknown modifier", () => {
    expect(() =>
      parseHotkeyCombination("Hyper + K" as HotkeyCombination),
    ).toThrow();
  });

  it.each(["Ctrl + K", "Control + K", "Meta + K", "Cmd + K", "Command + K"])(
    "rejects raw modifier %s in favor of Mod",
    combination => {
      expect(() =>
        parseHotkeyCombination(combination as HotkeyCombination),
      ).toThrow();
    },
  );
});
