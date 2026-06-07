import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import {
  HOTKEY_PRIORITY,
  HotkeyProvider,
  HotkeyRegistry,
  useHotkey,
  useHotkeyRegistry,
  type HotkeyCombination,
  type HotkeyDebugEvent,
  type HotkeyRegistryConfig,
} from "../index";
import { pressKey, stubPlatform } from "../test-support";

interface HotkeyProbeProps {
  combination: HotkeyCombination;
  onTrigger: (event: KeyboardEvent) => void;
  config?: HotkeyRegistryConfig;
}

function HotkeyProbe({ combination, onTrigger, config }: HotkeyProbeProps) {
  useHotkey(combination, onTrigger, config);
  return null;
}

const pressModK = () =>
  pressKey(document, { key: "k", code: "KeyK", ctrlKey: true });

const countEvents = (
  debug: ReturnType<typeof vi.fn>,
  type: HotkeyDebugEvent["type"],
): number =>
  debug.mock.calls.filter(call => (call[0] as HotkeyDebugEvent).type === type).length;

beforeEach(() => {
  stubPlatform("other"); // Mod === Ctrl
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("HotkeyProvider + useHotkey", () => {
  it("registers a hotkey and invokes the handler on a matching keydown", () => {
    const registry = new HotkeyRegistry(document);
    const onTrigger = vi.fn();
    render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} />
      </HotkeyProvider>,
    );

    pressModK();

    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent);
  });

  it("stops handling once the component unmounts", () => {
    const registry = new HotkeyRegistry(document);
    const onTrigger = vi.fn();
    const { unmount } = render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} />
      </HotkeyProvider>,
    );

    pressModK();
    expect(onTrigger).toHaveBeenCalledTimes(1);

    unmount();
    pressModK();
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it("does not invoke a disabled hotkey", () => {
    const registry = new HotkeyRegistry(document);
    const onTrigger = vi.fn();
    render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ enabled: false }} />
      </HotkeyProvider>,
    );

    pressModK();

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("re-evaluates enabled across re-renders", () => {
    const registry = new HotkeyRegistry(document);
    const onTrigger = vi.fn();
    const { rerender } = render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ enabled: true }} />
      </HotkeyProvider>,
    );

    pressModK();
    expect(onTrigger).toHaveBeenCalledTimes(1);

    rerender(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ enabled: false }} />
      </HotkeyProvider>,
    );

    pressModK();
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it("invokes the latest handler after the callback prop changes", () => {
    const registry = new HotkeyRegistry(document);
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={first} />
      </HotkeyProvider>,
    );

    rerender(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={second} />
      </HotkeyProvider>,
    );
    pressModK();

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("does not re-register when only the handler identity changes", () => {
    const debug = vi.fn();
    const registry = new HotkeyRegistry(document, {
      debug,
      debugEvents: { registered: true, unregistered: true },
    });
    const { rerender } = render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={vi.fn()} />
      </HotkeyProvider>,
    );

    rerender(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={vi.fn()} />
      </HotkeyProvider>,
    );

    expect(countEvents(debug, "registered")).toBe(1);
    expect(countEvents(debug, "unregistered")).toBe(0);
  });

  it("does not re-register when a config object with identical values is passed", () => {
    const debug = vi.fn();
    const registry = new HotkeyRegistry(document, {
      debug,
      debugEvents: { registered: true, unregistered: true },
    });
    const onTrigger = vi.fn();
    const { rerender } = render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ priority: HOTKEY_PRIORITY.page }} />
      </HotkeyProvider>,
    );

    // A brand-new config object with the same values must not churn the registry.
    rerender(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ priority: HOTKEY_PRIORITY.page }} />
      </HotkeyProvider>,
    );

    expect(countEvents(debug, "registered")).toBe(1);
    expect(countEvents(debug, "unregistered")).toBe(0);
  });

  it("honors priority across separate components", () => {
    const registry = new HotkeyRegistry(document);
    const low = vi.fn();
    const high = vi.fn();
    render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={low} config={{ priority: HOTKEY_PRIORITY.page }} />
        <HotkeyProbe combination="Mod + K" onTrigger={high} config={{ priority: HOTKEY_PRIORITY.overlay }} />
      </HotkeyProvider>,
    );

    pressModK();

    expect(high).toHaveBeenCalledTimes(1);
    expect(low).not.toHaveBeenCalled();
  });

  it("supports allowInEditable through the hook", () => {
    const registry = new HotkeyRegistry(document);
    const onTrigger = vi.fn();
    render(
      <HotkeyProvider registry={registry}>
        <HotkeyProbe combination="Mod + K" onTrigger={onTrigger} config={{ allowInEditable: true }} />
      </HotkeyProvider>,
    );
    const input = document.createElement("input");
    document.body.append(input);

    pressKey(input, { key: "k", code: "KeyK", ctrlKey: true });

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });
});

describe("useHotkeyRegistry", () => {
  it("returns the registry provided to the HotkeyProvider", () => {
    const registry = new HotkeyRegistry(document);
    let received: HotkeyRegistry | undefined;

    function Consumer() {
      received = useHotkeyRegistry();
      return null;
    }

    render(
      <HotkeyProvider registry={registry}>
        <Consumer />
      </HotkeyProvider>,
    );

    expect(received).toBe(registry);
  });

  it("throws when used outside a HotkeyProvider", () => {
    function Consumer() {
      useHotkeyRegistry();
      return null;
    }
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(/HotkeyProvider/);

    consoleError.mockRestore();
  });
});
