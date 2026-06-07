import { vi } from "vitest";

/**
 * Test support shared across integration suites.
 *
 * The philosophy here is "use it the way the browser does": real
 * `KeyboardEvent`s dispatched through a real event target. The only thing we
 * stub is the platform, because the registry's modifier semantics are
 * deliberately platform-dependent and we need that to be deterministic.
 */

const APPLE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const NON_APPLE_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36";

/**
 * Pins the platform the registry detects via `navigator.userAgent`.
 * Undone by `vi.restoreAllMocks()` (call it in an `afterEach`).
 */
export const stubPlatform = (platform: "apple" | "other"): void => {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
    platform === "apple" ? APPLE_USER_AGENT : NON_APPLE_USER_AGENT,
  );
};

/**
 * Builds and dispatches a real, bubbling, cancelable keydown event — exactly
 * what a browser produces. Returns the event so callers can read
 * `defaultPrevented` and friends afterwards.
 */
export const pressKey = (
  target: EventTarget,
  init: KeyboardEventInit,
): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
};
