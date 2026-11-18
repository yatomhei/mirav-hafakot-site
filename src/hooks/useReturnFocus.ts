import { useLayoutEffect, useRef } from "react";

/**
 * Radix returns focus to a Dialog.Trigger, but these dialogs open from outside one. Remember
 * what had focus when the dialog opened (before Radix moves it) and return there on close.
 */
export function useReturnFocus(open: boolean) {
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) opener.current = document.activeElement as HTMLElement | null;
  }, [open]);
  return (event: Event) => {
    const target = opener.current;
    opener.current = null;
    if (target && document.contains(target)) {
      event.preventDefault();
      target.focus();
    }
  };
}
