'use client';

import React, { useId, useRef } from 'react';
import { X } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';
import { useDialogFocus } from './Modal';
import { ModalTitle } from './Text';

export type DrawerSize = Extract<Size, 'm' | 'l'>;
export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open: boolean;
  title: string;
  onClose: () => void;
  /** m 480 px, l 720 px. */
  size?: DrawerSize;
  footer?: React.ReactNode;
  closeLabel?: string;
  children?: React.ReactNode;
}
export const drawerWidths: Record<DrawerSize, number> = { m: 480, l: 720 };

/** Right side panel, full height, for a detail sheet read without leaving the list (MAIR-608, Figma `Base/Drawer`). */
export const Drawer = ({ open, title, onClose, size = 'm', footer, closeLabel = 'Fermer le panneau', children, className = '', style, ...props }: DrawerProps) => {
  const titleId = useId(); const panel = useRef<HTMLDivElement>(null);
  useDialogFocus(open, panel, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[var(--mairie-text)]/40" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div {...props} ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-size={size}
        className={`flex h-full w-full flex-col border-l border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] shadow-xl outline-none ${className}`.trim()}
        style={{ maxWidth: drawerWidths[size], ...style }}>
        <header className="flex items-start justify-between gap-4 border-b border-[var(--mairie-border)]" style={{ padding: 'var(--mairie-space-m) var(--mairie-space-l)' }}>
          <ModalTitle id={titleId}>{title}</ModalTitle>
          <button type="button" aria-label={closeLabel} onClick={onClose} className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface-raised)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"><Icon icon={X} size="m" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: 'var(--mairie-space-l)' }}>{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--mairie-border)]" style={{ padding: 'var(--mairie-space-m) var(--mairie-space-l)' }}>{footer}</footer>}
      </div>
    </div>
  );
};
