'use client';

import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';
import type { SelectOption } from './SelectField';

export interface FilterSelectProps<T extends string = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** Filter name shown before the value ("Statut"), also the accessible name. */
  label: string;
  options: readonly SelectOption<T>[];
  /** Empty string = no filter. */
  value: T | '';
  onChange: (value: T | '') => void;
  /** Label of the "no filter" entry. */
  allLabel?: string;
  size?: Extract<Size, 's' | 'm' | 'l'>;
}

/** Compact filter of a list toolbar (MAIR-608, Figma `Base/FilterSelect`): active look while a value is chosen. */
export function FilterSelect<T extends string = string>({ label, options, value, onChange, allLabel = 'Tous', size = 'm', disabled, className = '', style, ...props }: FilterSelectProps<T>) {
  const active = value !== '';
  const current = options.find((option) => option.value === value);
  return (
    <span className={`relative inline-flex items-center rounded-[var(--mairie-radius-m)] border font-medium transition focus-within:ring-2 focus-within:ring-[var(--mairie-accent)]/20 ${active ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)]'} ${disabled ? 'opacity-60' : ''} ${className}`.replace(/\s+/g, ' ').trim()} style={{ height: `var(--mairie-control-${size})`, paddingInline: 'var(--mairie-space-s)', gap: 'var(--mairie-space-xs)', fontSize: `var(--mairie-text-${size})`, ...style }} data-active={active || undefined} data-size={size}>
      <Icon icon={Filter} size={size === 'l' ? 'm' : 's'} />
      <span aria-hidden="true" className="whitespace-nowrap">{label}{current ? ` : ${current.label}` : ''}</span>
      <Icon icon={ChevronDown} size={size === 'l' ? 'm' : 's'} />
      <select {...props} aria-label={label} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T | '')} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
        <option value="">{allLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
    </span>
  );
}
