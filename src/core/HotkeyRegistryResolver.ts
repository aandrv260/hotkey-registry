import type { HotkeyDebugEventType } from "../types";
import { isHotkeyEnabled } from "../utils/hotkeyConfig.utils";
import { getHotkeyEventCombinationKey } from "../utils/hotkeyKeyNormalization.utils";
import { isEditableHotkeyTarget } from "../utils/editableHotkeyTarget.utils";
import { doesHotkeyEventMatch } from "../utils/matchHotkeyEvent.utils";
import type HotkeyDebugger from "./HotkeyDebugger";
import type HotkeyRegistrationStore from "./HotkeyRegistrationStore";
import type {
  HotkeyBindingId,
  RegisteredHotkeyBinding,
} from "./hotkeyRegistry.types";

/**
 * Resolves keydown events against registered bindings.
 * It owns priority, eligibility, and winner execution while delegating debug emission.
 */
export default class HotkeyRegistryResolver {
  public constructor(
    private readonly store: HotkeyRegistrationStore,
    private readonly hotkeyDebugger: HotkeyDebugger,
  ) {}

  public handleKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.repeat) {
      return;
    }

    const combinationKey = getHotkeyEventCombinationKey(event);
    const candidates = this.getSortedCandidates(event, combinationKey);

    if (candidates.length === 0) {
      return;
    }

    const isEditable = isEditableHotkeyTarget(event.target);
    this.handleCandidates(event, candidates, isEditable);
  }

  private handleCandidates(
    event: KeyboardEvent,
    candidates: readonly RegisteredHotkeyBinding[],
    isEditable: boolean,
  ) {
    const skippedIds = new Set<HotkeyBindingId>();

    for (const candidate of candidates) {
      const ignoredReason = this.getIgnoredReason(candidate, isEditable);

      if (ignoredReason) {
        skippedIds.add(candidate.id);
        this.emitDebugEvent(candidate, event, "ignored", ignoredReason);
        continue;
      }

      this.emitDebugEvent(candidate, event, "matched");
      this.handleWinner(event, candidate);
      this.emitShadowedCandidateEvents(
        event,
        candidates,
        candidate,
        skippedIds,
        isEditable,
      );
      return;
    }
  }

  private handleWinner(event: KeyboardEvent, winner: RegisteredHotkeyBinding) {
    if (winner.config.preventDefault) {
      event.preventDefault();
    }

    if (winner.config.stopPropagation) {
      event.stopPropagation();
    }

    try {
      winner.onTrigger(event);
    } catch (error: unknown) {
      this.emitDebugEvent(winner, event, "failed", undefined, error);
      throw error;
    }

    this.emitDebugEvent(winner, event, "triggered");
  }

  private emitShadowedCandidateEvents(
    event: KeyboardEvent,
    candidates: readonly RegisteredHotkeyBinding[],
    winner: RegisteredHotkeyBinding,
    skippedIds: Set<HotkeyBindingId>,
    isEditable: boolean,
  ) {
    for (const candidate of candidates) {
      if (candidate.id === winner.id || skippedIds.has(candidate.id)) {
        continue;
      }

      const ignoredReason = this.getIgnoredReason(candidate, isEditable);

      if (ignoredReason) {
        this.emitDebugEvent(candidate, event, "ignored", ignoredReason);
        continue;
      }

      this.emitDebugEvent(candidate, event, "ignored", "priority-shadowed");
    }
  }

  private getSortedCandidates(event: KeyboardEvent, combinationKey: string) {
    return this.store
      .getBindingsByCombinationKey(combinationKey)
      .filter(binding =>
        doesHotkeyEventMatch(event, binding.parsedHotkeyCombination),
      )
      .sort((firstBinding, secondBinding) => {
        const priorityDifference =
          secondBinding.config.priority - firstBinding.config.priority;

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return secondBinding.registrationOrder - firstBinding.registrationOrder;
      });
  }

  private getIgnoredReason(
    binding: RegisteredHotkeyBinding,
    isEditable: boolean,
  ): string | null {
    if (!isHotkeyEnabled(binding.config.enabled)) {
      return "disabled";
    }

    if (!binding.config.allowInEditable && isEditable) {
      return "editable-target";
    }

    return null;
  }

  private emitDebugEvent(
    binding: RegisteredHotkeyBinding,
    event: KeyboardEvent,
    type: HotkeyDebugEventType,
    reason?: string,
    error?: unknown,
  ) {
    this.hotkeyDebugger.emit({
      type,
      keyCombination: binding.keyCombination,
      config: binding.config,
      registryConfig: binding.registryConfig,
      parsedHotkeyCombination: binding.parsedHotkeyCombination,
      keyboardEvent: event,
      reason,
      error,
    });
  }
}
