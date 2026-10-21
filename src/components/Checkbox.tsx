'use client';

import React from 'react';
import { Check } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
}

export const choiceBox: Record<Size, number> = { xs: 14, s: 16, m: 20, l: 24, xl: 28 };

/** Checkbox with label (MAIR-608, Figma `Base/Checkbox`): multiple choice or an option saved with the form. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, size = 'm', disabled, id, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `choice-${generated}`;
  const box = choiceBox[size];
  return (
    <div className={`flex flex-col ${disabled ? 'opacity-60' : ''} ${className}`.trim()} style={{ gap: 'var(--mairie-space-xs)', ...style }} data-size={size} data-invalid={error ? 'true' : undefined}>
      <label htmlFor={inputId} className="inline-flex cursor-pointer items-center" style={{ gap: 'var(--mairie-space-s)', fontSize: `var(--mairie-text-${size})` }}>
        <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: box, height: box }}>
          <input {...props} ref={ref} id={inputId} type="checkbox" disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-[var(--mairie-radius-xs)] border border-[var(--mairie-control-border)] bg-[var(--mairie-control-background)] checked:border-[var(--mairie-action-background)] checked:bg-[var(--mairie-action-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] aria-[invalid=true]:border-[var(--mairie-error-text)] disabled:cursor-not-allowed" />
          <Icon icon={Check} size={size === 'xs' ? 'xs' : size === 'xl' ? 'm' : 's'} className="pointer-events-none relative hidden text-[var(--mairie-on-action)] peer-checked:block" />
        </span>
        <span className="text-[var(--mairie-text)]">{label}</span>
      </label>
      {hint && !error ? <p id={`${inputId}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)', paddingLeft: box + 8 }}>{hint}</p> : null}
      {error ? <p id={`${inputId}-error`} role="alert" className="text-[var(--mairie-error-text)]" style={{ fontSize: 'var(--mairie-text-s)', paddingLeft: box + 8 }}>{error}</p> : null}
    </div>
  );
});
