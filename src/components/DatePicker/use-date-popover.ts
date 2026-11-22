'use client';

import React from 'react';

/**
 * Open state of the DatePicker / DateRangePicker popover (MAIR-1099): Échap and a click outside close it,
 * and the focus goes back to the trigger when the popover closed from inside it (choice, Échap, Appliquer).
 * Tabbing out of the field closes it without moving the focus.
 */
export function useDatePopover(disabled = false) {
  const [requested, setOpen] = React.useState(false);
  // A field disabled while open closes without an effect: the open state is derived.
  const open = requested && !disabled;
  const wrapper = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent | MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  const popoverProps = {
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    },
  };
  const wrapperProps = {
    ref: wrapper,
    onBlur: (event: React.FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (open && next && wrapper.current && !wrapper.current.contains(next)) setOpen(false);
    },
  };

  return { open, setOpen, close, toggle: () => { if (!disabled) setOpen(value => !value); }, trigger, wrapperProps, popoverProps };
}
