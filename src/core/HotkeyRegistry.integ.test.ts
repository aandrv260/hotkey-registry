import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import type { HotkeyCombination, HotkeyDebugEvent } from "../types";
import { pressKey, stubPlatform } from "../test-support";
import { HOTKEY_PRIORITY } from "./hotkeyPriority.constants";
import HotkeyRegistry from "./HotkeyRegistry";
import type { HotkeyRegistryOptions } from "./HotkeyDebugger.types";

/** A registry wired to the real document, initialized, and torn down after the test. */
const createRegistry = (options?: HotkeyRegistryOptions): HotkeyRegistry => {
  const registry = new HotkeyRegistry(document, options);
  registry.init();
  onTestFinished(() => registry.cleanup());
  return registry;
};

const debugEventsOfType = (
  debug: ReturnType<typeof vi.fn>,
  type: HotkeyDebugEvent["type"],
): HotkeyDebugEvent[] =>
  debug.mock.calls
    .map(call => call[0] as HotkeyDebugEvent)
    .filter(event => event.type === type);

beforeEach(() => {
  stubPlatform("other"); // Mod === Ctrl
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("listener lifecycle", () => {
  it("does not handle events before init() is called", () => {
    const registry = new HotkeyRegistry(document);
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("handles events once init() is called", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("stops handling after cleanup()", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    registry.cleanup();
    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("never double-handles when init() is called repeatedly", () => {
    const registry = createRegistry();
    registry.init(); // second call must be a no-op
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("tolerates cleanup() being called repeatedly", () => {
    const registry = createRegistry();
    registry.cleanup();
    expect(() => registry.cleanup()).not.toThrow();
  });
});

describe("registration", () => {
  it("invokes the handler with the keyboard event on a match", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent);
  });

  it("stops invoking after the returned unregister() runs", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    const unregister = registry.register("Mod + K", handler);

    unregister();
    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("keeps distinct combinations independent", () => {
    const registry = createRegistry();
    const onK = vi.fn();
    const onJ = vi.fn();
    registry.register("Mod + K", onK);
    registry.register("Mod + J", onJ);

    pressKey(document, { key: "j", code: "KeyJ", ctrlKey: true });

    expect(onJ).toHaveBeenCalledTimes(1);
    expect(onK).not.toHaveBeenCalled();
  });

  it("rejects a malformed combination", () => {
    const registry = createRegistry();
    expect(() =>
      registry.register("Mod+K" as HotkeyCombination, vi.fn()),
    ).toThrow();
  });
});

describe("default action handling", () => {
  it("prevents the default action by default for the winning binding", () => {
    const registry = createRegistry();
    registry.register("Mod + K", vi.fn());

    const event = pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves the default action alone when preventDefault is false", () => {
    const registry = createRegistry();
    registry.register("Mod + K", vi.fn(), { preventDefault: false });

    const event = pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(event.defaultPrevented).toBe(false);
  });

  it("does not prevent the default action when nothing matches", () => {
    const registry = createRegistry();
    registry.register("Mod + K", vi.fn());

    const event = pressKey(document, { key: "j", code: "KeyJ", ctrlKey: true });

    expect(event.defaultPrevented).toBe(false);
  });

  it("stops propagation when asked", () => {
    const registry = createRegistry();
    const ancestorListener = vi.fn();
    window.addEventListener("keydown", ancestorListener);
    registry.register("Mod + K", vi.fn(), { stopPropagation: true });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });
    window.removeEventListener("keydown", ancestorListener);

    expect(ancestorListener).not.toHaveBeenCalled();
  });

  it("lets the event keep propagating by default", () => {
    const registry = createRegistry();
    const ancestorListener = vi.fn();
    window.addEventListener("keydown", ancestorListener);
    registry.register("Mod + K", vi.fn());

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });
    window.removeEventListener("keydown", ancestorListener);

    expect(ancestorListener).toHaveBeenCalledTimes(1);
  });
});

describe("priority resolution", () => {
  it("lets the higher-priority binding win and keeps the lower one inert", () => {
    const registry = createRegistry();
    const low = vi.fn();
    const high = vi.fn();
    registry.register("Mod + K", low, { priority: HOTKEY_PRIORITY.page });
    registry.register("Mod + K", high, { priority: HOTKEY_PRIORITY.overlay });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(high).toHaveBeenCalledTimes(1);
    expect(low).not.toHaveBeenCalled();
  });

  it("lets the newer registration win on equal priority", () => {
    const registry = createRegistry();
    const older = vi.fn();
    const newer = vi.fn();
    registry.register("Mod + K", older);
    registry.register("Mod + K", newer);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(newer).toHaveBeenCalledTimes(1);
    expect(older).not.toHaveBeenCalled();
  });
});

describe("eligibility", () => {
  it("does not fire a disabled binding", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler, { enabled: false });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("evaluates the enabled predicate at dispatch time", () => {
    const registry = createRegistry();
    let enabled = false;
    const handler = vi.fn();
    registry.register("Mod + K", handler, { enabled: () => enabled });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();

    enabled = true;
    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores bindings while typing in an editable target by default", () => {
    const registry = createRegistry();
    const input = document.createElement("input");
    document.body.append(input);
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(input, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("fires inside editable targets when allowInEditable is set", () => {
    const registry = createRegistry();
    const input = document.createElement("input");
    document.body.append(input);
    const handler = vi.fn();
    registry.register("Mod + K", handler, { allowInEditable: true });

    pressKey(input, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("lets a lower-priority editable-friendly binding win when the top one is blocked", () => {
    const registry = createRegistry();
    const input = document.createElement("input");
    document.body.append(input);
    const blocked = vi.fn();
    const editableFriendly = vi.fn();
    registry.register("Mod + K", blocked, { priority: HOTKEY_PRIORITY.overlay });
    registry.register("Mod + K", editableFriendly, {
      priority: HOTKEY_PRIORITY.page,
      allowInEditable: true,
    });

    pressKey(input, { key: "k", code: "KeyK", ctrlKey: true });

    expect(editableFriendly).toHaveBeenCalledTimes(1);
    expect(blocked).not.toHaveBeenCalled();
  });
});

describe("event guards", () => {
  it("ignores auto-repeat events", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true, repeat: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores events fired mid-composition", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true, isComposing: true });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe("modifier matching", () => {
  it("matches Mod via Ctrl on non-Apple platforms", () => {
    stubPlatform("other");
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("matches Mod via Cmd on Apple platforms", () => {
    stubPlatform("apple");
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", metaKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire when an unexpected modifier is also held", () => {
    const registry = createRegistry();
    const handler = vi.fn();
    registry.register("Mod + K", handler);

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true, shiftKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("distinguishes Shift-qualified combinations", () => {
    const registry = createRegistry();
    const plain = vi.fn();
    const shifted = vi.fn();
    registry.register("Mod + P", plain);
    registry.register("Mod + Shift + P", shifted);

    pressKey(document, { key: "p", code: "KeyP", ctrlKey: true, shiftKey: true });

    expect(shifted).toHaveBeenCalledTimes(1);
    expect(plain).not.toHaveBeenCalled();
  });
});

describe("debug stream", () => {
  it("emits a triggered event for the winning binding by default", () => {
    const debug = vi.fn();
    const registry = createRegistry({ debug });
    registry.register("Mod + K", vi.fn());

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(debugEventsOfType(debug, "triggered")).toHaveLength(1);
  });

  it("does not emit registered or ignored events by default", () => {
    const debug = vi.fn();
    const registry = createRegistry({ debug });
    registry.register("Mod + K", vi.fn(), { enabled: false });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    expect(debugEventsOfType(debug, "registered")).toHaveLength(0);
    expect(debugEventsOfType(debug, "ignored")).toHaveLength(0);
  });

  it("emits registered/unregistered events when opted in", () => {
    const debug = vi.fn();
    const registry = createRegistry({
      debug,
      debugEvents: { registered: true, unregistered: true },
    });

    const unregister = registry.register("Mod + K", vi.fn());
    unregister();

    expect(debugEventsOfType(debug, "registered")).toHaveLength(1);
    expect(debugEventsOfType(debug, "unregistered")).toHaveLength(1);
  });

  it("emits an ignored event with a reason when opted in", () => {
    const debug = vi.fn();
    const registry = createRegistry({ debug, debugEvents: { ignored: true } });
    registry.register("Mod + K", vi.fn(), { enabled: false });

    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

    const ignored = debugEventsOfType(debug, "ignored");
    expect(ignored).toHaveLength(1);
    expect(ignored[0].reason).toBe("disabled");
  });

  it("emits a failed event carrying the thrown error", () => {
    const debug = vi.fn();
    const registry = createRegistry({ debug });
    const boom = new Error("handler exploded");
    registry.register("Mod + K", () => {
      throw boom;
    });

    // A throwing listener is reported by the DOM, not thrown to the dispatcher;
    // suppress the report so the runner stays quiet while we read the event.
    const suppress = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", suppress);
    pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });
    window.removeEventListener("error", suppress);

    const failed = debugEventsOfType(debug, "failed");
    expect(failed).toHaveLength(1);
    expect(failed[0].error).toBe(boom);
  });
});
