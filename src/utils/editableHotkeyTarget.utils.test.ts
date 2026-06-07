import { afterEach, describe, expect, it } from "vitest";
import { isEditableHotkeyTarget } from "./editableHotkeyTarget.utils";

describe("isEditableHotkeyTarget()", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const element = <T extends HTMLElement>(create: () => T): T => {
    const node = create();
    document.body.append(node);
    return node;
  };

  it("treats input, textarea and select as editable", () => {
    expect(
      isEditableHotkeyTarget(element(() => document.createElement("input"))),
    ).toBe(true);
    expect(
      isEditableHotkeyTarget(element(() => document.createElement("textarea"))),
    ).toBe(true);
    expect(
      isEditableHotkeyTarget(element(() => document.createElement("select"))),
    ).toBe(true);
  });

  it("treats contenteditable elements as editable", () => {
    const div = element(() => {
      const node = document.createElement("div");
      node.setAttribute("contenteditable", "true");
      return node;
    });
    expect(isEditableHotkeyTarget(div)).toBe(true);
  });

  it("treats role=textbox as editable", () => {
    const div = element(() => {
      const node = document.createElement("div");
      node.setAttribute("role", "textbox");
      return node;
    });
    expect(isEditableHotkeyTarget(div)).toBe(true);
  });

  it("treats a node nested inside an editable region as editable", () => {
    const editable = element(() => {
      const node = document.createElement("div");
      node.setAttribute("contenteditable", "true");
      return node;
    });
    const child = document.createElement("span");
    editable.append(child);
    expect(isEditableHotkeyTarget(child)).toBe(true);
  });

  it("treats a plain element as not editable", () => {
    expect(
      isEditableHotkeyTarget(element(() => document.createElement("div"))),
    ).toBe(false);
  });

  it("treats a non-element target (or null) as not editable", () => {
    expect(isEditableHotkeyTarget(document)).toBe(false);
    expect(isEditableHotkeyTarget(null)).toBe(false);
  });
});
