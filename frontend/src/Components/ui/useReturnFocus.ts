import { useRef } from 'react';

interface AutoFocusEvent {
  preventDefault: () => void;
}

export interface ReturnFocusHandlers {
  /** Call first thing in Radix `onOpenAutoFocus`: remembers the element that opened the dialog. */
  rememberOpener: () => void;
  /** Use as Radix `onCloseAutoFocus`: focuses the opener again (FR-009). */
  onCloseAutoFocus: (event: AutoFocusEvent) => void;
}

/**
 * Radix Dialog/AlertDialog return focus to their own `Trigger`. When the dialog is controlled
 * (`open` state) and opened by a button outside Radix, there is no Trigger and focus would fall
 * to `<body>`. This hook remembers the opener and restores the focus to it on close.
 */
export const useReturnFocus = (enabled = true): ReturnFocusHandlers => {
  const openerRef = useRef<HTMLElement | null>(null);

  const rememberOpener = () => {
    if (!enabled) return;
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
  };

  const onCloseAutoFocus = (event: AutoFocusEvent) => {
    if (!enabled) return;
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener && opener.isConnected) {
      event.preventDefault();
      opener.focus();
    }
  };

  return { rememberOpener, onCloseAutoFocus };
};
