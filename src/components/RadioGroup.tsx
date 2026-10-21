'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { choiceBox } from './Checkbox';

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** Legend of the group (e.g. "Thème"). */
  label: React.ReactNode;
  name: string;
  options: readonly RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
  /** Lay the options side by side. */
  inline?: boolean;
  required?: boolean;
}

/** Exclusive choice (MAIR-608, Figma `Base/Radio`): a fieldset of native radios, controlled or uncontrolled. */
export function RadioGroup<T extends string = string>({ label, name, options, value, defaultValue, onChange, hint, error, size = 'm', inline = false, required, disabled, className = '', style, ...props }: RadioGroupProps<T>) {
  const generated = React.useId();
  const box = choiceBox[size];
  return (
    <fieldset {...props} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? `${generated}-error` : hint ? `${generated}-hint` : undefined} data-size={size} className={`m-0 min-w-0 border-0 p-0 ${disabled ? 'opacity-60' : ''} ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mairie-space-xs)', ...style }}>
      <legend className="mb-1 font-medium text-[var(--mairie-text)]" style={{ fontSize: `var(--mairie-text-${size === 'xl' ? 'l' : size === 'xs' ? 'xs' : 's'})` }}>
        {label}
        {required ? <span aria-hidden="true" className="text-[var(--mairie-error-text)]"> *</span> : null}
      </legend>
      <div className={`flex ${inline ? 'flex-row flex-wrap' : 'flex-col'}`} style={{ gap: inline ? 'var(--mairie-space-m)' : 'var(--mairie-space-s)' }}>
        {options.map((option) => {
          const id = `${generated}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} className="inline-flex cursor-pointer items-center" style={{ gap: 'var(--mairie-space-s)', fontSize: `var(--mairie-text-${size})` }}>
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                disabled={option.disabled}
                required={required}
                onChange={() => onChange?.(option.value)}
                className="m-0 shrink-0 cursor-pointer appearance-none rounded-full border border-[var(--mairie-control-border)] bg-[var(--mairie-control-background)] checked:border-[var(--mairie-action-background)] checked:bg-[var(--mairie-action-background)] checked:shadow-[inset_0_0_0_3px_var(--mairie-control-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed"
                style={{ width: box, height: box }}
              />
              <span className="text-[var(--mairie-text)]">{option.label}{option.hint ? <span className="block text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{option.hint}</span> : null}</span>
            </label>
          );
        })}
      </div>
      {hint && !error ? <p id={`${generated}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{hint}</p> : null}
      {error ? <p id={`${generated}-error`} role="alert" className="text-[var(--mairie-error-text)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{error}</p> : null}
    </fieldset>
  );
}
