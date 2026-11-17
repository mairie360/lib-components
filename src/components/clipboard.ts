'use client';

import React from 'react';

/** How long the « Copié » feedback stays (MAIR-1069). */
export const COPIED_FEEDBACK_MS = 1500;

/**
 * Copies a text to the clipboard and tells for ~1.5 s that it worked (CopyField, RecoveryCodes).
 * `copy()` resolves `false` when the browser refuses (no permission, insecure context): the caller then
 * lets the user copy by hand.
 */
export function useCopyFeedback(options: { onCopy?: () => void; resetMs?: number } = {}) {
  const { onCopy, resetMs = COPIED_FEEDBACK_MS } = options;
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = React.useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setCopied(false);
      return false;
    }
    setCopied(true);
    onCopy?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetMs);
    return true;
  }, [onCopy, resetMs]);
  return { copied, copy };
}

/** Selects the whole content of an element, so that the user can copy it by hand (Ctrl+C). */
export function selectContent(element: Element | null): void {
  if (!element || typeof window === 'undefined') return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}
