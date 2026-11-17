'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { choiceBox } from '../Checkbox';
import { Icon } from '../Icon';
import { StatusPill } from '../StatusPill';
import { componentMarker } from '../component-marker';

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  /** `card` variant: glyph before the label. */
  icon?: LucideIcon;
  /** `card` variant: short success pill after the label (« Recommandé »). */
  badge?: string;
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
  /** `card` (MAIR-1073, Figma `Base/RadioGroup/Card`): each option is a bordered card with an optional icon, badge and help text; the selected card gets the accent border. */
  variant?: 'default' | 'card';
  required?: boolean;
}

/** Exclusive choice (MAIR-608, Figma `Base/Radio`): a fieldset of native radios, controlled or uncontrolled. */
export function RadioGroup<T extends string = string>({ label, name, options, value, defaultValue, onChange, hint, error, size = 'm', inline = false, variant = 'default', required, disabled, className = '', style, ...props }: RadioGroupProps<T>) {
  const generated = React.useId();
  const box = choiceBox[size];
  return (
    <fieldset {...props} {...componentMarker('RadioGroup', props)} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? `${generated}-error` : hint ? `${generated}-hint` : undefined} data-size={size} data-variant={variant} className={`m-0 min-w-0 border-0 p-0 ${disabled ? 'opacity-60' : ''} ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mairie-space-xs)', ...style }}>
      <legend className="mb-1 font-medium text-[var(--mairie-text)]" style={{ fontSize: `var(--mairie-text-${size === 'xl' ? 'l' : size === 'xs' ? 'xs' : 's'})` }}>
        {label}
        {required ? <span aria-hidden="true" className="text-[var(--mairie-error-text)]"> *</span> : null}
      </legend>
      <div className={`flex ${inline ? 'flex-row flex-wrap' : 'flex-col'}`} style={{ gap: inline ? 'var(--mairie-space-m)' : 'var(--mairie-space-s)' }}>
        {options.map((option) => {
          const id = `${generated}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} data-card={variant === 'card' ? 'true' : undefined} className={variant === 'card' ? `flex cursor-pointer items-start border border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] has-[:checked]:border-[var(--mairie-accent)] has-[:checked]:bg-[var(--mairie-accent-surface)] has-[:checked]:shadow-[inset_0_0_0_1px_var(--mairie-accent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--mairie-accent)] ${option.disabled ? 'cursor-not-allowed opacity-60' : ''}` : 'inline-flex cursor-pointer items-center'} style={{ gap: 'var(--mairie-space-s)', fontSize: `var(--mairie-text-${size})`, ...(variant === 'card' ? { padding: 'var(--mairie-space-m)', borderRadius: 'var(--mairie-radius-m)' } : {}) }}>
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
                className={`m-0 shrink-0 cursor-pointer appearance-none rounded-full border border-[var(--mairie-control-border)] bg-[var(--mairie-control-background)] checked:border-[var(--mairie-action-background)] checked:bg-[var(--mairie-action-background)] checked:shadow-[inset_0_0_0_3px_var(--mairie-control-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed ${variant === 'card' ? 'mt-0.5' : ''}`}
                style={{ width: box, height: box }}
              />
              {variant === 'card' ? (
                <span className="flex min-w-0 flex-1 flex-col" style={{ gap: 'var(--mairie-space-xs)' }}>
                  <span className="flex flex-wrap items-center font-semibold text-[var(--mairie-text)]" style={{ gap: 'var(--mairie-space-s)' }}>
                    {option.icon ? <Icon icon={option.icon} size="s" /> : null}
                    {option.label}
                    {option.badge ? <StatusPill tone="success" label={option.badge} /> : null}
                  </span>
                  {option.hint ? <span className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{option.hint}</span> : null}
                </span>
              ) : (
                <span className="text-[var(--mairie-text)]">{option.label}{option.hint ? <span className="block text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{option.hint}</span> : null}</span>
              )}
            </label>
          );
        })}
      </div>
      {hint && !error ? <p id={`${generated}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{hint}</p> : null}
      {error ? <p id={`${generated}-error`} role="alert" className="text-[var(--mairie-error-text)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{error}</p> : null}
    </fieldset>
  );
}
