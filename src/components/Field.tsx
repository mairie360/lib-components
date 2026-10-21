'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Id of the control the label points to. */
  htmlFor: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Error message; rendered with role=alert and linked through aria-describedby by the field components. */
  error?: React.ReactNode;
  required?: boolean;
  size?: Size;
  disabled?: boolean;
  children: React.ReactNode;
}

/** Ids a field component links to the control through aria-describedby. */
export function fieldDescriptionIds(id: string, hint: unknown, error: unknown) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
}

/** Text size of the label and hint for a control size (one step below the control text on the small end). */
export const labelSize = (size: Size): Size => (size === 'xs' ? 'xs' : size === 's' ? 's' : size === 'm' ? 's' : 'm');

/**
 * Label, hint and error around a form control (MAIR-608, Figma anatomy of every
 * `Base/*Field`). Field components render it; use it directly only for a custom control.
 */
export const Field = ({ htmlFor, label, hint, error, required = false, size = 'm', disabled = false, children, className = '', ...props }: FieldProps) => (
  <div {...props} data-size={size} data-invalid={error ? 'true' : undefined} className={`mairie-field flex flex-col ${disabled ? 'opacity-60' : ''} ${className}`.replace(/\s+/g, ' ').trim()} style={{ gap: 'var(--mairie-space-xs)', ...props.style }}>
    <label htmlFor={htmlFor} className="font-medium text-[var(--mairie-text)]" style={{ fontSize: `var(--mairie-text-${labelSize(size)})` }}>
      {label}
      {required ? <span aria-hidden="true" className="text-[var(--mairie-error-text)]"> *</span> : null}
    </label>
    {children}
    {hint && !error ? <p id={`${htmlFor}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: `var(--mairie-text-${labelSize(size)})` }}>{hint}</p> : null}
    {error ? (
      <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1 text-[var(--mairie-error-text)]" style={{ fontSize: `var(--mairie-text-${labelSize(size)})` }}>
        <Icon icon={AlertCircle} size="s" />
        {error}
      </p>
    ) : null}
  </div>
);

/** Shared classes of the bordered control boxes (inputs, selects, textareas). */
export function controlClass(invalid: boolean) {
  return `w-full rounded-[var(--mairie-radius-m)] border bg-[var(--mairie-control-background)] text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus-within:ring-2 focus-within:ring-[var(--mairie-accent)]/20 disabled:cursor-not-allowed disabled:bg-[var(--mairie-surface-raised)] ${invalid ? 'border-[var(--mairie-error-text)] focus-within:border-[var(--mairie-error-text)]' : 'border-[var(--mairie-control-border)] focus-within:border-[var(--mairie-accent)]'}`;
}

export function controlStyle(size: Size): React.CSSProperties {
  return { minHeight: `var(--mairie-control-${size})`, fontSize: `var(--mairie-text-${size})`, paddingInline: `var(--mairie-space-${size === 'xs' ? 'xs' : 's'})` };
}
