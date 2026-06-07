import HotkeyDebugger from "./HotkeyDebugger";
import HotkeyRegistrationStore from "./HotkeyRegistrationStore";
import HotkeyRegistryResolver from "./HotkeyRegistryResolver";
import type { HotkeyCombination } from "../types";
import type {
  HotkeyRegistryConfig,
  HotkeyRegistryOptions,
} from "./HotkeyDebugger.types";
import type {
  HotkeyRegistryEventListener,
  HotkeyRegistryEventSource,
} from "./hotkeyRegistry.types";

/**
 * Hotkey client that owns the document listener lifecycle.
 *
 * It composes the registry store and resolver so React can later inject one shared instance.
 */
export default class HotkeyRegistry {
  private readonly hotkeyDebugger: HotkeyDebugger;
  private readonly store: HotkeyRegistrationStore;
  private readonly resolver: HotkeyRegistryResolver;
  private readonly eventSource: HotkeyRegistryEventSource;
  private isInitialized: boolean;

  private readonly onKeyDown: HotkeyRegistryEventListener = event => {
    this.resolver.handleKeyDown(event);
  };

  public constructor(
    eventSource: HotkeyRegistryEventSource,
    options?: HotkeyRegistryOptions,
  ) {
    this.isInitialized = false;
    this.eventSource = eventSource;
    this.hotkeyDebugger = new HotkeyDebugger(options);
    this.store = new HotkeyRegistrationStore();
    this.resolver = new HotkeyRegistryResolver(this.store, this.hotkeyDebugger);
  }

  public init() {
    if (this.isInitialized) {
      return;
    }

    this.eventSource.addEventListener("keydown", this.onKeyDown);
    this.isInitialized = true;
  }

  public cleanup() {
    if (!this.isInitialized) {
      return;
    }

    this.eventSource.removeEventListener("keydown", this.onKeyDown);
    this.isInitialized = false;
  }

  public register(
    keyCombination: HotkeyCombination,
    onTrigger: (event: KeyboardEvent) => void,
    config?: HotkeyRegistryConfig,
  ): () => void {
    const binding = this.store.register(keyCombination, onTrigger, config);

    this.hotkeyDebugger.emit({
      type: "registered",
      keyCombination: binding.keyCombination,
      config: binding.config,
      registryConfig: binding.registryConfig,
      parsedHotkeyCombination: binding.parsedHotkeyCombination,
    });

    return () => {
      const removedBinding = this.store.unregister(binding.id);

      if (!removedBinding) {
        return;
      }

      this.hotkeyDebugger.emit({
        type: "unregistered",
        keyCombination: removedBinding.keyCombination,
        config: removedBinding.config,
        registryConfig: removedBinding.registryConfig,
        parsedHotkeyCombination: removedBinding.parsedHotkeyCombination,
      });
    };
  }
}
