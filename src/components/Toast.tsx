'use client';

import React, { createContext, forwardRef, useContext } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';

import type { Tone } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';

// Internal provider coordination: a visual toast must not announce a second time.
export const ToastAnnouncementContext = createContext(true);

/** @deprecated MAIR-608: use `tone` (`error` maps to `danger`). */
export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'role'> {
  message: string;
  title?: string;
  tone?: Tone;
  /** @deprecated use `tone`. */
  variant?: ToastVariant;
  closeLabel?: string;
  onClose?: () => void;
  /** 0–1 remaining share of the display time; renders the countdown bar. */
  progress?: number;
  /** Duration of the countdown transition (ms), 0 while paused. */
  progressDuration?: number;
}
export const toastTone = (tone: Tone | undefined, variant: ToastVariant | undefined): Tone => tone ?? (variant === 'error' ? 'danger' : variant ?? 'info');
const icons: Record<Tone, LucideIcon> = { primary: Info, secondary: Info, neutral: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX, info: Info };
const colours: Record<Tone, { background: string; color: string }> = {
  primary: { background: 'var(--mairie-accent-surface)', color: 'var(--mairie-accent)' },
  secondary: { background: 'var(--mairie-secondary-surface)', color: 'var(--mairie-secondary)' },
  neutral: { background: 'var(--mairie-surface)', color: 'var(--mairie-text)' },
  success: { background: 'var(--mairie-success-surface)', color: 'var(--mairie-success-text)' },
  warning: { background: 'var(--mairie-warning-surface)', color: 'var(--mairie-warning-text)' },
  danger: { background: 'var(--mairie-error-surface)', color: 'var(--mairie-error-text)' },
  info: { background: 'var(--mairie-info-surface)', color: 'var(--mairie-info-text)' },
};

/** Ephemeral overlay notification after an action (MAIR-608, Figma `Base/Toast`). Use `useToast().error/success/warning/info`. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({ message, title, tone: toneProp, variant, closeLabel = 'Fermer la notification', onClose, progress, progressDuration = 0, className = '', style, onKeyDown, ...props }, ref) {
  const announce = useContext(ToastAnnouncementContext);
  const tone = toastTone(toneProp, variant);
  const urgent = tone === 'danger';
  return <div {...props} ref={ref} role={announce ? (urgent ? 'alert' : 'status') : 'group'} aria-label={announce ? props['aria-label'] : title ?? message} aria-live={announce ? (urgent ? 'assertive' : 'polite') : undefined} aria-atomic={announce ? true : undefined}
    data-tone={tone}
    onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'Escape' && onClose) { event.preventDefault(); event.stopPropagation(); onClose(); } }}
    className={`relative flex flex-col overflow-hidden border border-[var(--mairie-border)] shadow-lg ${className}`.trim()}
    style={{ borderRadius: 'var(--mairie-radius-l)', ...colours[tone], ...style }}>
    <div className="flex items-start gap-3" style={{ padding: 'var(--mairie-space-m)' }}>
      <span className="shrink-0 pt-0.5"><Icon icon={icons[tone]} size="m" /></span>
      <div className="min-w-0 flex-1 break-words">{title && <p className="font-semibold" style={{ fontSize: 'var(--mairie-text-s)' }}>{title}</p>}<p style={{ fontSize: 'var(--mairie-text-s)' }}>{message}</p></div>
      {onClose && <button type="button" aria-label={closeLabel} onClick={onClose} className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"><Icon icon={X} size="s" /></button>}
    </div>
    {typeof progress === 'number' && (
      <div aria-hidden="true" data-testid="toast-progress" className="h-1 w-full bg-current/15">
        <div className="mairie-toast-progress h-full bg-current" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, transition: progressDuration > 0 ? `width ${progressDuration}ms linear` : 'none' }} />
      </div>
    )}
  </div>;
});
