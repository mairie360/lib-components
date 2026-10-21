'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';
import { Help, ModalTitle } from './Text';

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open: boolean;
  /** Dialog name; rich content (a live status under the title) is allowed. */
  title: React.ReactNode;
  /** Short text under the title, linked through aria-describedby. */
  description?: React.ReactNode;
  onClose: () => void;
  /** Max width: xs 320, s 400, m 520, l 720, xl 960 px. */
  size?: Size;
  /** Actions row; use `FormActions` or the preset buttons. */
  footer?: React.ReactNode;
  /** Initial focus; defaults to the first focusable control, then the close button. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  closeLabel?: string;
  /** Rendered inside the dialog, inline (no portal: the dialog follows the page's providers and tests). */
  children?: React.ReactNode;
  /** Clicking the backdrop closes the dialog (default true). */
  closeOnBackdrop?: boolean;
}
export const modalWidths: Record<Size, number> = { xs: 320, s: 400, m: 520, l: 720, xl: 960 };
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside the panel and restores focus to the opener on close. */
export function useDialogFocus(open: boolean, panel: React.RefObject<HTMLElement | null>, onClose: () => void, initialFocusRef?: React.RefObject<HTMLElement | null>) {
  // The latest onClose is read through a ref: an inline closure re-created on every parent
  // render must not re-run the effect (that would move focus out of the field being typed in).
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !panel.current) return;
    const opener = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    (initialFocusRef?.current ?? focusables()[0] ?? node).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables(); if (items.length === 0) { event.preventDefault(); return; }
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', keydown);
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { node.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; if (opener?.isConnected) opener.focus(); };
  }, [open, panel, initialFocusRef]);
}

/** Centred window over a veil: header (title, close), free content, actions footer (MAIR-608, Figma `Base/Modal`). */
export const Modal = ({ open, title, description, onClose, size = 'm', footer, initialFocusRef, closeLabel = 'Fermer la fenêtre', children, closeOnBackdrop = true, className = '', style, ...props }: ModalProps) => {
  const titleId = useId(); const descriptionId = useId(); const panel = useRef<HTMLDivElement>(null);
  useDialogFocus(open, panel, onClose, initialFocusRef);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mairie-text)]/40 p-4 backdrop-blur-sm" onMouseDown={event => { if (closeOnBackdrop && event.target === event.currentTarget) onClose(); }}>
      <div {...props} ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1} data-size={size}
        className={`flex max-h-full w-full flex-col overflow-hidden border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] shadow-xl outline-none ${className}`.trim()}
        style={{ maxWidth: modalWidths[size], borderRadius: 'var(--mairie-radius-xl)', ...style }}>
        <header className="flex items-start justify-between gap-4 border-b border-[var(--mairie-border)]" style={{ padding: 'var(--mairie-space-m) var(--mairie-space-l)' }}>
          <div className="min-w-0">
            <ModalTitle id={titleId}>{title}</ModalTitle>
            {description ? <Help id={descriptionId} as="div" className="mt-1">{description}</Help> : null}
          </div>
          <button type="button" aria-label={closeLabel} onClick={onClose} className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface-raised)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"><Icon icon={X} size="m" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: 'var(--mairie-space-l)' }}>{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--mairie-border)]" style={{ padding: 'var(--mairie-space-m) var(--mairie-space-l)' }}>{footer}</footer>}
      </div>
    </div>
  );
};
