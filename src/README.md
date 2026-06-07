# Hotkey Registry

A framework-agnostic desktop-browser shortcut system with a thin React adapter.
The package is split by concern so the keyboard engine stays free of React and can
be tested and reused on its own.

## Layering

Dependencies point inward only — outer layers depend on inner layers, never the
reverse.

```
types  ◄── utils  ◄── core  ◄── ui (React adapter)
```

- **`types/`** — Pure type definitions (combinations, config, debug, parsed
  events). No runtime code, no dependencies.
- **`utils/`** — Pure functions: combination parsing, key normalization, event
  matching, platform detection, editable-target detection, config resolution, and
  debug-event creation. Depend only on `types/`.
- **`core/`** — The React-free engine. `HotkeyRegistry` owns the single `keydown`
  listener and composes:
  - `HotkeyRegistrationStore` — owns binding ids, registration order, and the
    normalized combination index.
  - `HotkeyRegistryResolver` — resolves a keydown against candidates by priority
    and eligibility, then runs the winner.
  - `HotkeyDebugger` — resolves and filters debug settings before emitting events.
- **`ui/`** — The React adapter: `HotkeyProvider` (injects one shared registry via
  context and owns its lifecycle), `useHotkeyRegistry`, and `useHotkey`
  (registers a binding for the lifetime of a component, with a stabilized config).

The public API is re-exported from `src/index.ts`.

## Usage

```tsx
import { HotkeyProvider, HotkeyRegistry, useHotkey } from "@/index";

const registry = new HotkeyRegistry(document);

function Root() {
  return (
    <HotkeyProvider registry={registry}>
      <App />
    </HotkeyProvider>
  );
}

function App() {
  useHotkey("Mod + K", () => openCommandPalette());
  useHotkey("Escape", () => closeOverlay(), { priority: HOTKEY_PRIORITY.overlay });
  return null;
}
```

## Debug Events

Registry debug output is intentionally quiet by default. Unless configured, only
`triggered` and `failed` events are emitted. Lifecycle and routing events such as
`registered`, `unregistered`, `ignored`, and `matched` are opt-in.

`HotkeyDebugger` owns debug callback resolution, event filtering, event creation,
and emission. Individual hotkeys can pass their own `debug` callback and
`debugEvents` filter through `useHotkey(keyCombination, onTrigger, config?)` (or
`registry.register(...)`). Per-hotkey `debugEvents` override the registry-level
filter for that binding, and per-hotkey `debug` wins over the registry-level
callback. If no resolved debug callback exists, no debug event is emitted.

Debug event types:

- `registered`: a binding was accepted and added to the registry.
- `unregistered`: a binding was removed from the registry.
- `ignored`: a matching binding did not run because it was disabled, blocked, or
  shadowed by another binding.
- `matched`: a binding matched and was selected as the winner before execution.
- `triggered`: the winning binding callback ran successfully.
- `failed`: the winning binding callback threw; the original error is rethrown.

## Dispatch Rules

- `enabled` functions are evaluated when a matching keydown happens.
- `repeat` and `isComposing` block dispatch for all matching bindings.
- Editable-target checks are per binding, so a lower-priority binding that allows
  editable targets can still handle the event.
- Higher `priority` wins; newer registrations win same-priority ties.
- Only the winning binding applies `preventDefault` and `stopPropagation`.
- Trigger callback errors emit a `failed` debug event and then rethrow the
  original error.
