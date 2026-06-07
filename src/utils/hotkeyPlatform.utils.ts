export const isApplePlatform = (): boolean => {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
};

export const isModKeyPressed = (event: KeyboardEvent): boolean => {
  return isApplePlatform() ? event.metaKey : event.ctrlKey;
};

/** The modifier that is not the platform "Mod" key (Ctrl on Apple, Meta elsewhere). */
const isNonModSystemModifierPressed = (event: KeyboardEvent): boolean => {
  return isApplePlatform() ? event.ctrlKey : event.metaKey;
};

/**
 * Ensures Ctrl/Meta match the binding: bindings without Mod reject any Ctrl/Meta;
 * bindings with Mod require exactly the platform shortcut key (Cmd on Apple, Ctrl
 * elsewhere) and reject the opposite system modifier.
 */
export const systemModifiersMatchExpected = (
  event: KeyboardEvent,
  expectsMod: boolean,
): boolean => {
  if (!expectsMod) {
    return !event.ctrlKey && !event.metaKey;
  }

  return isModKeyPressed(event) && !isNonModSystemModifierPressed(event);
};
