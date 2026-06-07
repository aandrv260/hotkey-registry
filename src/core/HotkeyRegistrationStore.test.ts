import { describe, expect, it, vi } from "vitest";
import type { HotkeyCombination } from "../types";
import HotkeyRegistrationStore from "./HotkeyRegistrationStore";

describe("HotkeyRegistrationStore", () => {
  it("returns a binding describing the registration", () => {
    const store = new HotkeyRegistrationStore();
    const onTrigger = vi.fn();

    const binding = store.register("Mod + K", onTrigger);

    expect(binding.keyCombination).toBe("Mod + K");
    expect(binding.onTrigger).toBe(onTrigger);
    expect(binding.parsedHotkeyCombination).toEqual({ key: "K", modifiers: ["Mod"] });
    expect(binding.combinationKey).toBe("Mod+k");
    expect(typeof binding.id).toBe("string");
  });

  it("resolves config defaults while preserving the raw registry config", () => {
    const store = new HotkeyRegistrationStore();
    const config = { preventDefault: false };

    const binding = store.register("Mod + K", vi.fn(), config);

    expect(binding.config.preventDefault).toBe(false);
    expect(binding.config.enabled).toBe(true); // default still applied
    expect(binding.registryConfig).toBe(config);
  });

  it("assigns an increasing registration order to each binding", () => {
    const store = new HotkeyRegistrationStore();

    const first = store.register("Mod + K", vi.fn());
    const second = store.register("Mod + J", vi.fn());

    expect(second.registrationOrder).toBeGreaterThan(first.registrationOrder);
  });

  it("indexes a binding under its normalized combination key", () => {
    const store = new HotkeyRegistrationStore();

    const binding = store.register("Mod + K", vi.fn());

    expect(store.getBindingsByCombinationKey(binding.combinationKey)).toContain(binding);
  });

  it("returns every binding registered under the same combination", () => {
    const store = new HotkeyRegistrationStore();

    const first = store.register("Mod + K", vi.fn());
    const second = store.register("Mod + K", vi.fn());

    const found = store.getBindingsByCombinationKey(first.combinationKey);

    expect(found).toHaveLength(2);
    expect(found).toEqual(expect.arrayContaining([first, second]));
  });

  it("returns an empty array for an unknown combination key", () => {
    const store = new HotkeyRegistrationStore();

    expect(store.getBindingsByCombinationKey("Mod+z")).toEqual([]);
  });

  it("unregister removes the binding and returns it", () => {
    const store = new HotkeyRegistrationStore();
    const binding = store.register("Mod + K", vi.fn());

    expect(store.unregister(binding.id)).toBe(binding);
    expect(store.getBindingsByCombinationKey(binding.combinationKey)).toEqual([]);
  });

  it("unregister returns null for an unknown id", () => {
    const store = new HotkeyRegistrationStore();

    expect(store.unregister("does-not-exist")).toBeNull();
  });

  it("unregister is idempotent for the same id", () => {
    const store = new HotkeyRegistrationStore();
    const binding = store.register("Mod + K", vi.fn());

    store.unregister(binding.id);

    expect(store.unregister(binding.id)).toBeNull();
  });

  it("removing one of several bindings leaves the rest indexed", () => {
    const store = new HotkeyRegistrationStore();
    const first = store.register("Mod + K", vi.fn());
    const second = store.register("Mod + K", vi.fn());

    store.unregister(first.id);

    expect(store.getBindingsByCombinationKey(first.combinationKey)).toEqual([second]);
  });

  it("throws when registering a malformed combination", () => {
    const store = new HotkeyRegistrationStore();

    expect(() =>
      store.register("Mod+K" as HotkeyCombination, vi.fn()),
    ).toThrow();
  });
});
