import type { HotkeyCombination } from "../types";
import { resolveHotkeyConfig } from "../utils/hotkeyConfig.utils";
import { getParsedHotkeyCombinationKey } from "../utils/hotkeyKeyNormalization.utils";
import { parseHotkeyCombination } from "../utils/parseHotkeyCombination.utils";
import type {
  HotkeyBindingId,
  RegisteredHotkeyBinding,
} from "./hotkeyRegistry.types";
import type { HotkeyRegistryConfig } from "./HotkeyDebugger.types";

/**
 * Stores registered hotkey bindings and keeps the normalized combination index.
 * It owns ids, registration order, unregistering, and candidate lookup only.
 */
export default class HotkeyRegistrationStore {
  private readonly bindingsById = new Map<
    HotkeyBindingId,
    RegisteredHotkeyBinding
  >();

  private readonly bindingIdsByCombinationKey = new Map<
    string,
    Set<HotkeyBindingId>
  >();

  private nextRegistrationOrder = 0;

  public register(
    keyCombination: HotkeyCombination,
    onTrigger: (event: KeyboardEvent) => void,
    config?: HotkeyRegistryConfig,
  ): RegisteredHotkeyBinding {
    const parsedHotkeyCombination = parseHotkeyCombination(keyCombination);

    if (!parsedHotkeyCombination) {
      throw new Error(
        `Failed to register invalid hotkey combination "${keyCombination}".`,
      );
    }

    const id = this.createBindingId(keyCombination);
    const combinationKey = getParsedHotkeyCombinationKey(parsedHotkeyCombination);

    const binding: RegisteredHotkeyBinding = {
      id,
      keyCombination,
      onTrigger,
      config: resolveHotkeyConfig(config),
      registryConfig: config,
      parsedHotkeyCombination,
      combinationKey,
      registrationOrder: this.nextRegistrationOrder,
    };

    this.nextRegistrationOrder += 1;
    this.bindingsById.set(binding.id, binding);
    this.addBindingToCombinationIndex(binding);

    return binding;
  }

  public unregister(id: HotkeyBindingId): RegisteredHotkeyBinding | null {
    const binding = this.bindingsById.get(id);

    if (!binding) {
      return null;
    }

    this.bindingsById.delete(id);
    this.removeBindingFromCombinationIndex(binding);

    return binding;
  }

  public getBindingsByCombinationKey(
    combinationKey: string,
  ): readonly RegisteredHotkeyBinding[] {
    const bindingIds = this.bindingIdsByCombinationKey.get(combinationKey);

    if (!bindingIds) {
      return [];
    }

    const bindings: RegisteredHotkeyBinding[] = [];

    for (const bindingId of bindingIds) {
      const binding = this.bindingsById.get(bindingId);

      if (binding) {
        bindings.push(binding);
      }
    }

    return bindings;
  }

  private addBindingToCombinationIndex(binding: RegisteredHotkeyBinding) {
    const bindingIds =
      this.bindingIdsByCombinationKey.get(binding.combinationKey) ?? new Set();

    bindingIds.add(binding.id);
    this.bindingIdsByCombinationKey.set(binding.combinationKey, bindingIds);
  }

  private removeBindingFromCombinationIndex(binding: RegisteredHotkeyBinding) {
    const bindingIds = this.bindingIdsByCombinationKey.get(binding.combinationKey);

    if (!bindingIds) {
      return;
    }

    bindingIds.delete(binding.id);

    if (bindingIds.size === 0) {
      this.bindingIdsByCombinationKey.delete(binding.combinationKey);
    }
  }

  private createBindingId(keyCombination: HotkeyCombination): HotkeyBindingId {
    return `${keyCombination}:${this.nextRegistrationOrder}`;
  }
}
