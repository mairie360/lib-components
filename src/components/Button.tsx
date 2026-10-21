'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size, Tone } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Text of the button; `children` may replace it for rich content. */
  label?: string;
  children?: React.ReactNode;
  /** solid = main action, outline = secondary action, ghost = discreet action, link = looks like a link. */
  variant?: ButtonVariant;
  /** Semantic colour; the normalised presets (CreateButton, DeleteButton…) pick it for you. */
  tone?: Tone;
  /** Height, padding, text and icon follow the shared scale (xs 24 px … xl 56 px). */
  size?: Size;
  /** Shows a spinner, sets aria-busy and disables the button while an action is pending. */
  loading?: boolean;
  /** Leading (default) or trailing lucide icon. */
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
}

/** Horizontal padding per size, in px (Figma Base/Button). */
const paddingX: Record<Size, number> = { xs: 8, s: 12, m: 16, l: 20, xl: 24 };

const surfaces: Record<Tone, string> = {
  primary: 'var(--mairie-accent-surface)',
  secondary: 'var(--mairie-secondary-surface)',
  neutral: 'var(--mairie-surface-raised)',
  success: 'var(--mairie-success-surface)',
  warning: 'var(--mairie-warning-surface)',
  danger: 'var(--mairie-error-surface)',
  info: 'var(--mairie-info-surface)',
};
const inks: Record<Tone, string> = {
  primary: 'var(--mairie-accent)',
  secondary: 'var(--mairie-secondary)',
  neutral: 'var(--mairie-text)',
  success: 'var(--mairie-success-text)',
  warning: 'var(--mairie-warning-text)',
  danger: 'var(--mairie-error-text)',
  info: 'var(--mairie-info-text)',
};
const solid: Record<Tone, string> = {
  primary: 'bg-[var(--mairie-action-background)] text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)]',
  secondary: 'bg-[var(--mairie-secondary-action-background)] text-[var(--mairie-on-secondary)] hover:bg-[var(--mairie-secondary-action-hover-background)]',
  neutral: 'bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] hover:bg-[var(--mairie-border)]',
  success: 'bg-[var(--mairie-success-action-background)] text-[var(--mairie-on-secondary)] hover:bg-[var(--mairie-success-action-hover-background)]',
  warning: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)] hover:brightness-95',
  danger: 'bg-[var(--mairie-error-action-background)] text-[var(--mairie-on-secondary)] hover:bg-[var(--mairie-error-action-hover-background)]',
  info: 'bg-[var(--mairie-info-surface)] text-[var(--mairie-info-text)] hover:brightness-95',
};
const outlineBorder: Record<Tone, string> = { ...inks, neutral: 'var(--mairie-control-border)' };

/** Classes and inline tokens of one variant × tone; shared with IconButton and LinkButton. */
export function buttonAppearance(variant: ButtonVariant, tone: Tone): { className: string; style: React.CSSProperties } {
  if (variant === 'solid') return { className: solid[tone], style: {} };
  const ink = inks[tone];
  const hover = 'hover:bg-[var(--button-hover-surface)]';
  const hoverToken = { ['--button-hover-surface' as string]: surfaces[tone] } as React.CSSProperties;
  if (variant === 'outline') return { className: `border bg-[var(--mairie-surface)] ${hover}`, style: { color: ink, borderColor: outlineBorder[tone], ...hoverToken } };
  if (variant === 'ghost') return { className: `bg-transparent ${hover}`, style: { color: ink, ...hoverToken } };
  return { className: 'bg-transparent underline underline-offset-4 hover:no-underline', style: { color: ink } };
}

/** Inline size tokens shared by every button-like control. */
export function buttonSizing(size: Size, square = false): React.CSSProperties {
  return {
    height: `var(--mairie-control-${size})`,
    minWidth: square ? `var(--mairie-control-${size})` : undefined,
    paddingInline: square ? 0 : `${paddingX[size]}px`,
    fontSize: `var(--mairie-text-${size})`,
    borderRadius: 'var(--mairie-radius-m)',
    gap: `var(--mairie-space-${size === 'xs' ? 'xs' : 's'})`,
  };
}

export const buttonBaseClass = 'inline-flex shrink-0 items-center justify-center font-semibold leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-50';

/** Spinner sized like the button icon; decorative, the button itself carries aria-busy. */
export const ButtonSpinner = ({ size }: { size: Size }) => (
  <span aria-hidden="true" className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent" style={{ width: `var(--mairie-icon-${size})`, height: `var(--mairie-icon-${size})` }} />
);

/**
 * The one button of the fronts (MAIR-608, Figma `Base/Button/*`). Prefer the
 * normalised presets (`CreateButton`, `SaveButton`, `DeleteButton`…) and fall
 * back to this base for a new case.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { label, children, variant = 'solid', tone = 'primary', size = 'm', loading = false, icon, iconPosition = 'start', fullWidth = false, className = '', style, type = 'button', disabled, ...props },
  ref,
) {
  const appearance = buttonAppearance(variant, tone);
  const glyph = loading ? <ButtonSpinner size={size} /> : icon ? <Icon icon={icon} size={size} /> : null;
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={`${buttonBaseClass} ${appearance.className} ${fullWidth ? 'w-full' : ''} ${variant === 'link' ? '!px-0' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ ...buttonSizing(size), ...appearance.style, ...style }}
    >
      {iconPosition === 'start' ? glyph : null}
      {children ?? label}
      {iconPosition === 'end' ? glyph : null}
    </button>
  );
});
