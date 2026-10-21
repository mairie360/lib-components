'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'defaultValue' | 'onChange'> {
  label: React.ReactNode;
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Formats the displayed value, e.g. `v => `${v} px``. */
  format?: (value: number) => React.ReactNode;
  hint?: React.ReactNode;
  size?: Size;
}

/** Range input with label and live value (MAIR-608, Figma `Base/Slider`). */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, min, max, step = 1, value, defaultValue, onChange, format = (current) => String(current), hint, size = 'm', disabled, id, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `slider-${generated}`;
  const [internal, setInternal] = React.useState(defaultValue ?? min);
  const current = value ?? internal;
  return (
    <div className={`flex flex-col ${disabled ? 'opacity-60' : ''} ${className}`.trim()} style={{ gap: 'var(--mairie-space-xs)', ...style }} data-size={size}>
      <div className="flex items-center justify-between" style={{ gap: 'var(--mairie-space-s)' }}>
        <label htmlFor={inputId} className="font-medium text-[var(--mairie-text)]" style={{ fontSize: `var(--mairie-text-${size})` }}>{label}</label>
        <output htmlFor={inputId} className="font-medium text-[var(--mairie-muted)]" style={{ fontSize: `var(--mairie-text-${size === 'xs' ? 'xs' : 's'})` }}>{format(current)}</output>
      </div>
      <input
        {...props}
        ref={ref}
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        aria-valuetext={String(format(current))}
        onChange={(event) => { const next = Number(event.target.value); if (value === undefined) setInternal(next); onChange?.(next); }}
        className="w-full cursor-pointer accent-[var(--mairie-action-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed"
        style={{ height: 'var(--mairie-control-xs)' }}
      />
      {hint ? <p id={`${inputId}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{hint}</p> : null}
    </div>
  );
});
