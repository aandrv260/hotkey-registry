import { describe, expect, it } from "vitest";
import { isObjectEmpty } from "./object.utils";

describe("isObjectEmpty()", () => {
  it("is true for an object with no own keys", () => {
    expect(isObjectEmpty({})).toBe(true);
  });

  it("is false once the object has any key", () => {
    expect(isObjectEmpty({ a: 1 })).toBe(false);
  });
});
