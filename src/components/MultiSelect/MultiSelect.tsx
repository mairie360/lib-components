'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Field, controlClass, controlStyle } from '../Field';
import { Icon } from '../Icon';
import type { SelectOption } from '../SelectField';

export interface MultiSelectProps<T extends string = string> {
  label: React.ReactNode;
  options: readonly SelectOption<T>[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
  required?: boolean;
  disabled?: boolean;
  /** Placeholder of the search box filtering the options. */
  searchPlaceholder?: string;
  /** Native form name (one hidden input per selected value). */
  name?: string;
  id?: string;
  className?: string;
  /** Height of the option list, in options. */
  visibleOptions?: number;
}

/**
 * Several choices with chips and a filtered checkbox list (MAIR-608, Figma
 * `Base/Select` Kind=multi): always visible, so keyboard users never lose context.
 */
export function MultiSelect<T extends string = string>({ label, options, value, onChange, hint, error, size = 'm', required, disabled, searchPlaceholder = 'Filtrer…', name, id, className = '', visibleOptions = 5 }: MultiSelectProps<T>) {
  const generated = React.useId();
  const fieldId = id ?? `multi-${generated}`;
  const [query, setQuery] = React.useState('');
  const selected = options.filter((option) => value.includes(option.value));
  const normalized = query.trim().toLocaleLowerCase('fr');
  const visible = normalized ? options.filter((option) => option.label.toLocaleLowerCase('fr').includes(normalized)) : options;
  const toggle = (option: SelectOption<T>) => onChange(value.includes(option.value) ? value.filter((entry) => entry !== option.value) : [...value, option.value]);
  return (
    <Field htmlFor={fieldId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className}>
      <div className={`flex flex-col ${controlClass(Boolean(error))}`} style={{ ...controlStyle(size), minHeight: undefined, paddingInline: 0 }} data-multiselect>
        <div className="flex flex-wrap items-center" style={{ gap: 'var(--mairie-space-xs)', padding: 'var(--mairie-space-xs) var(--mairie-space-s)' }}>
          {selected.map((option) => (
            <span key={option.value} className="inline-flex items-center rounded-full bg-[var(--mairie-accent-surface)] font-medium text-[var(--mairie-accent)]" style={{ gap: 'var(--mairie-space-xs)', padding: '2px var(--mairie-space-xs) 2px var(--mairie-space-s)', fontSize: 'var(--mairie-text-s)' }}>
              {option.label}
              <button type="button" aria-label={`Retirer ${option.label}`} disabled={disabled} onClick={() => toggle(option)} className="inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)]"><Icon icon={X} size="xs" /></button>
              {name ? <input type="hidden" name={name} value={option.value} /> : null}
            </span>
          ))}
          <span className="inline-flex flex-1 items-center" style={{ gap: 'var(--mairie-space-xs)', minWidth: 120 }}>
            <Icon icon={Search} size="s" className="text-[var(--mairie-muted)]" />
            <input id={fieldId} type="search" value={query} disabled={disabled} placeholder={searchPlaceholder} aria-label={typeof label === 'string' ? `${label} : filtrer les options` : 'Filtrer les options'} aria-controls={`${fieldId}-options`} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--mairie-muted)]" style={{ fontSize: 'inherit', minHeight: 'var(--mairie-control-xs)' }} />
          </span>
        </div>
        <div id={`${fieldId}-options`} role="group" aria-label={typeof label === 'string' ? `Options : ${label}` : 'Options'} className="overflow-y-auto border-t border-[var(--mairie-border)]" style={{ maxHeight: `calc(var(--mairie-control-${size}) * ${visibleOptions})` }}>
          {visible.length === 0 ? <p className="text-[var(--mairie-muted)]" style={{ padding: 'var(--mairie-space-s)', fontSize: 'var(--mairie-text-s)' }}>Aucune option ne correspond.</p> : visible.map((option) => {
            const checked = value.includes(option.value);
            const optionId = `${fieldId}-${option.value}`;
            return (
              <label key={option.value} htmlFor={optionId} className={`flex cursor-pointer items-center hover:bg-[var(--mairie-surface-raised)] ${checked ? 'bg-[var(--mairie-accent-surface)]' : ''}`} style={{ gap: 'var(--mairie-space-s)', padding: 'var(--mairie-space-xs) var(--mairie-space-s)', minHeight: `var(--mairie-control-${size})`, fontSize: 'inherit' }}>
                <input id={optionId} type="checkbox" checked={checked} disabled={disabled || option.disabled} onChange={() => toggle(option)} className="accent-[var(--mairie-action-background)]" />
                <span className="text-[var(--mairie-text)]">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </Field>
  );
}
