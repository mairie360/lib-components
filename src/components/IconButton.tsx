'use client';

import React from 'react';
import { Bell, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Search, Trash2, X, type LucideIcon } from 'lucide-react';

import type { Size, Tone } from '@mairie360/lib-components/theme';
import { ButtonSpinner, buttonAppearance, buttonBaseClass, buttonSizing } from './Button';
import { Icon } from './Icon';

export type IconButtonPreset = 'close' | 'more' | 'edit' | 'delete' | 'previous' | 'next' | 'search' | 'notifications';
export type IconButtonTone = Extract<Tone, 'neutral' | 'primary' | 'danger'>;

const presets: Record<IconButtonPreset, { icon: LucideIcon; label: string; tone: IconButtonTone }> = {
  close: { icon: X, label: 'Fermer', tone: 'neutral' },
  more: { icon: MoreHorizontal, label: 'Plus d’actions', tone: 'neutral' },
  edit: { icon: Pencil, label: 'Modifier', tone: 'neutral' },
  delete: { icon: Trash2, label: 'Supprimer', tone: 'danger' },
  previous: { icon: ChevronLeft, label: 'Précédent', tone: 'neutral' },
  next: { icon: ChevronRight, label: 'Suivant', tone: 'neutral' },
  search: { icon: Search, label: 'Rechercher', tone: 'neutral' },
  notifications: { icon: Bell, label: 'Notifications', tone: 'neutral' },
};

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Normalised role: icon, accessible name and tone come from it. */
  preset?: IconButtonPreset;
  /** Required without a preset. */
  icon?: LucideIcon;
  /** Accessible name (aria-label); required without a preset. */
  label?: string;
  tone?: IconButtonTone;
  size?: Size;
  loading?: boolean;
  /** Pressed state for toggles (aria-pressed). */
  pressed?: boolean;
}

/** Square, icon-only button (MAIR-608, Figma `Base/IconButton` and `IconButton/*`). */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { preset, icon, label, tone, size = 'm', loading = false, pressed, className = '', style, type = 'button', disabled, ...props },
  ref,
) {
  const base = preset ? presets[preset] : undefined;
  const glyph = icon ?? base?.icon;
  const name = label ?? base?.label;
  const resolvedTone = tone ?? base?.tone ?? 'neutral';
  if (!glyph || !name) throw new Error('IconButton needs a preset or both an icon and a label.');
  const appearance = buttonAppearance('ghost', resolvedTone);
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={name}
      title={props.title ?? name}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      data-preset={preset}
      data-tone={resolvedTone}
      data-size={size}
      className={`${buttonBaseClass} ${appearance.className} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ ...buttonSizing(size, true), width: `var(--mairie-control-${size})`, ...appearance.style, ...style }}
    >
      {loading ? <ButtonSpinner size={size} /> : <Icon icon={glyph} size={size} />}
    </button>
  );
});
