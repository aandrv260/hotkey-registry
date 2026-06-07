export const isEditableHotkeyTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }

  return (
    target.getAttribute("role") === "textbox" ||
    target.closest(
      "[contenteditable='true'],[contenteditable=''],input,textarea,select,[role='textbox']",
    ) !== null
  );
};
