'use client';

import React, { createContext, forwardRef, useContext } from 'react';
import { X } from 'lucide-react';

// Internal provider coordination: a visual toast must not announce a second time.
export const ToastAnnouncementContext = createContext(true);

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'role'> {
  message: string;
  title?: string;
  variant?: ToastVariant;
  closeLabel?: string;
  onClose?: () => void;
}
const variants: Record<ToastVariant, string> = {
  info: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-text)]',
  success: 'bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
  warning: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
  error: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
};

/** Controlled feedback: the consumer supplies a message only after the relevant outcome is known. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({ message, title, variant = 'info', closeLabel = 'Fermer la notification', onClose, className = '', onKeyDown, ...props }, ref) {
  const announce = useContext(ToastAnnouncementContext);
  return <div {...props} ref={ref} role={announce ? (variant === 'error' ? 'alert' : 'status') : 'group'} aria-label={announce ? props['aria-label'] : title ?? message} aria-live={announce ? (variant === 'error' ? 'assertive' : 'polite') : undefined} aria-atomic={announce ? true : undefined}
    onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'Escape' && onClose) { event.preventDefault(); event.stopPropagation(); onClose(); } }}
    className={`flex items-start gap-3 rounded-xl border border-[var(--mairie-border)] p-4 shadow-lg ${variants[variant]} ${className}`}>
    <div className="min-w-0 flex-1 break-words">{title && <p className="font-semibold">{title}</p>}<p className="text-sm">{message}</p></div>
    {onClose && <button type="button" aria-label={closeLabel} onClick={onClose} className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"><X size={18} aria-hidden="true" /></button>}
  </div>;
});
