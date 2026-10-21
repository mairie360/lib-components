'use client';

import React from 'react';

import type { Size, Tone } from '@mairie360/lib-components/theme';

export interface StatusPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  label: string;
  tone?: Tone;
  size?: Size;
  /** Leading dot in the tone colour. */
  dot?: boolean;
}

const surfaces: Record<Tone, { background: string; color: string }> = {
  primary: { background: 'var(--mairie-accent-surface)', color: 'var(--mairie-accent)' },
  secondary: { background: 'var(--mairie-secondary-surface)', color: 'var(--mairie-secondary)' },
  neutral: { background: 'var(--mairie-surface-raised)', color: 'var(--mairie-text)' },
  success: { background: 'var(--mairie-success-surface)', color: 'var(--mairie-success-text)' },
  warning: { background: 'var(--mairie-warning-surface)', color: 'var(--mairie-warning-text)' },
  danger: { background: 'var(--mairie-error-surface)', color: 'var(--mairie-error-text)' },
  info: { background: 'var(--mairie-info-surface)', color: 'var(--mairie-info-text)' },
};
const heights: Record<Size, number> = { xs: 18, s: 22, m: 26, l: 30, xl: 36 };
const textSize: Record<Size, Size> = { xs: 'xs', s: 'xs', m: 's', l: 's', xl: 'm' };

/** Status or category pill (MAIR-608, Figma `Base/StatusPill`). Prefer `StatusPill status=` and `PriorityPill`. */
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(function StatusPill(
  { label, tone = 'neutral', size = 'm', dot = false, className = '', style, ...props }, ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      data-tone={tone}
      data-size={size}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none ${className}`.trim()}
      style={{ height: heights[size], paddingInline: `var(--mairie-space-${size === 'xs' ? 'xs' : 's'})`, fontSize: `var(--mairie-text-${textSize[size]})`, ...surfaces[tone], ...style }}
    >
      {dot && <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
});

/** One colour per business status in every front (Figma Status/*). */
export const statuses = {
  active: { label: 'Actif', tone: 'success' },
  inactive: { label: 'Inactif', tone: 'neutral' },
  invited: { label: 'Invité', tone: 'info' },
  expired: { label: 'Expiré', tone: 'neutral' },
  revoked: { label: 'Révoqué', tone: 'danger' },
  todo: { label: 'À faire', tone: 'neutral' },
  inprogress: { label: 'En cours', tone: 'primary' },
  review: { label: 'En revue', tone: 'warning' },
  done: { label: 'Terminé', tone: 'success' },
  late: { label: 'En retard', tone: 'danger' },
  draft: { label: 'Brouillon', tone: 'neutral' },
  published: { label: 'Publié', tone: 'success' },
  unknown: { label: 'Inconnu', tone: 'secondary' },
} as const satisfies Record<string, { label: string; tone: Tone }>;
export type Status = keyof typeof statuses;

export interface StatusBadgeProps extends Omit<StatusPillProps, 'label' | 'tone'> {
  status: Status;
  /** Override the French label (e.g. a count), the colour stays the status colour. */
  label?: string;
}
/** `<StatusBadge status="active" />`: the status presets of Figma Status/*. */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge({ status, label, ...props }, ref) {
  return <StatusPill ref={ref} dot data-status={status} {...props} label={label ?? statuses[status].label} tone={statuses[status].tone} />;
});

export const priorities = { high: { label: 'Haute', tone: 'danger' }, medium: { label: 'Moyenne', tone: 'warning' }, low: { label: 'Basse', tone: 'info' } } as const satisfies Record<string, { label: string; tone: Tone }>;
export type Priority = keyof typeof priorities;
export interface PriorityPillProps extends Omit<StatusPillProps, 'label' | 'tone'> { level: Priority; label?: string }
/** `<PriorityPill level="high" />` (Figma Priority/*). */
export const PriorityPill = React.forwardRef<HTMLSpanElement, PriorityPillProps>(function PriorityPill({ level, label, ...props }, ref) {
  return <StatusPill ref={ref} data-priority={level} {...props} label={label ?? priorities[level].label} tone={priorities[level].tone} />;
});
