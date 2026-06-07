import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  HOTKEY_PRIORITY,
  useHotkey,
  type HotkeyCombination,
  type HotkeyDebugEvent,
  type HotkeyDebugEventFilter,
} from "./index";
import "./App.css";

interface HotkeyDefinition {
  combination: HotkeyCombination;
  description: string;
  priority?: number;
  toggleable?: boolean;
}

const HOTKEY_DEFINITIONS: readonly HotkeyDefinition[] = [
  { combination: "Mod + K", description: "Open command palette" },
  { combination: "Mod + Shift + P", description: "Quick actions" },
  { combination: "Mod + S", description: "Save document", toggleable: true },
  { combination: "G", description: "Go to dashboard", toggleable: true },
  {
    combination: "Escape",
    description: "Dismiss overlay",
    priority: HOTKEY_PRIORITY.overlay,
  },
];

const DEBUG_EVENTS: HotkeyDebugEventFilter = {
  triggered: true,
  ignored: true,
};

const IS_APPLE =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

const APPLE_KEY_SYMBOLS: Record<string, string> = {
  Mod: "⌘",
  Shift: "⇧",
  Alt: "⌥",
  Escape: "Esc",
  Enter: "↵",
  Space: "␣",
};

const KEY_LABELS: Record<string, string> = {
  Mod: "Ctrl",
  Escape: "Esc",
  Space: "Space",
};

function renderKey(token: string): string {
  if (IS_APPLE && APPLE_KEY_SYMBOLS[token]) {
    return APPLE_KEY_SYMBOLS[token];
  }
  if (KEY_LABELS[token]) {
    return KEY_LABELS[token];
  }
  return token.length === 1 ? token.toUpperCase() : token;
}

function Keys({ combination }: { combination: string }) {
  const tokens = combination.split(" + ");
  return (
    <span className="keys" aria-label={combination}>
      {tokens.map((token, index) => (
        <Fragment key={token}>
          {index > 0 && <span className="keysep">+</span>}
          <kbd className="keycap">{renderKey(token)}</kbd>
        </Fragment>
      ))}
    </span>
  );
}

interface BindingRowProps {
  definition: HotkeyDefinition;
  enabled: boolean;
  onDebugEvent: (event: HotkeyDebugEvent) => void;
}

function BindingRow({ definition, enabled, onDebugEvent }: BindingRowProps) {
  const { combination, description, priority } = definition;
  const [hits, setHits] = useState(0);
  const [isFired, setIsFired] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useHotkey(
    combination,
    () => {
      setHits(current => current + 1);
      setIsFired(true);
      clearTimeout(flashTimeout.current);
      flashTimeout.current = setTimeout(() => setIsFired(false), 260);
    },
    { description, priority, enabled, debug: onDebugEvent, debugEvents: DEBUG_EVENTS },
  );

  const className = [
    "binding",
    isFired ? "is-fired" : "",
    enabled ? "" : "is-off",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={className}>
      <div className="body">
        <div className="desc">
          {description}
          <span className="hits">×{hits}</span>
        </div>
        <div className="tags">
          {priority === HOTKEY_PRIORITY.overlay && (
            <span className="tag priority">priority: overlay</span>
          )}
          {!enabled && <span className="tag off">disabled</span>}
        </div>
      </div>
      <Keys combination={combination} />
    </li>
  );
}

const MAX_LOG_ENTRIES = 50;

interface LogEntry {
  id: number;
  ts: string;
  type: HotkeyDebugEvent["type"];
  combination: string;
  reason?: string;
}

function formatTimestamp(): string {
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  const ms = now.getMilliseconds().toString().padStart(3, "0");
  return `${time}.${ms}`;
}

function App() {
  const [log, setLog] = useState<readonly LogEntry[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [isToggleEnabled, setIsToggleEnabled] = useState(true);
  const [text, setText] = useState("");
  const nextLogId = useRef(0);

  const handleDebugEvent = useCallback((event: HotkeyDebugEvent) => {
    setEventCount(current => current + 1);
    setLog(current => {
      const entry: LogEntry = {
        id: (nextLogId.current += 1),
        ts: formatTimestamp(),
        type: event.type,
        combination: event.keyCombination,
        reason: event.reason,
      };
      return [entry, ...current].slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  const platformLabel = useMemo(
    () => (IS_APPLE ? "⌘ macOS" : "Ctrl Win/Linux"),
    [],
  );

  return (
    <main className="inspector">
      <div className="titlebar">
        <span className="dots">
          <span />
          <span />
          <span />
        </span>
        <span className="path">
          <b>hotkey-registry</b>&nbsp;/&nbsp;inspector
        </span>
        <span className="spacer" />
        <span className="status">
          <span className="pulse" />
          {platformLabel}
        </span>
      </div>

      <header className="intro">
        <h1>
          Keyboard shortcut engine,
          <br />
          <span className="accent">inspected live.</span>
        </h1>
        <p>
          A framework-agnostic registry with a thin React adapter. Press any binding
          below and watch the resolver emit events into the console. Focus the field
          to see editable-target shortcuts get ignored.
        </p>
      </header>

      <div className="toolbar">
        <label className="toggle">
          <input
            type="checkbox"
            checked={isToggleEnabled}
            onChange={event => setIsToggleEnabled(event.target.checked)}
          />
          <span className="track" />
          Toggle <code>G</code> &amp; <code>Mod&nbsp;+&nbsp;S</code>
        </label>
        <span className="field">
          <span className="prompt">›</span>
          <input
            type="text"
            placeholder="type here — shortcuts are suppressed while focused"
            value={text}
            onChange={event => setText(event.target.value)}
            aria-label="Editable target test field"
          />
        </span>
      </div>

      <div className="workspace">
        <section className="pane">
          <div className="pane-head">
            <h2>Registered bindings</h2>
            <span className="count">{HOTKEY_DEFINITIONS.length}</span>
          </div>
          <ul className="bindings">
            {HOTKEY_DEFINITIONS.map(definition => (
              <BindingRow
                key={definition.combination}
                definition={definition}
                enabled={definition.toggleable ? isToggleEnabled : true}
                onDebugEvent={handleDebugEvent}
              />
            ))}
          </ul>
        </section>

        <section className="pane">
          <div className="pane-head">
            <h2>Event stream</h2>
            <span className="count">{eventCount}</span>
          </div>
          <ul className="console">
            {log.length === 0 ? (
              <li className="empty">waiting for input…</li>
            ) : (
              log.map(entry => (
                <li className="row" key={entry.id}>
                  <span className="ts">{entry.ts}</span>
                  <span className={`badge ${entry.type}`}>{entry.type}</span>
                  <span className="combo">{entry.combination}</span>
                  <span className="reason">{entry.reason ?? ""}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <footer className="statusbar">
        <span className="stat">
          <span className="dot">●</span> registry active
        </span>
        <span className="stat">
          bindings <b>{HOTKEY_DEFINITIONS.length}</b>
        </span>
        <span className="stat">
          events <b>{eventCount}</b>
        </span>
      </footer>
    </main>
  );
}

export default App;
