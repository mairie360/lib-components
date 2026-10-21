'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Field, controlClass, controlStyle, fieldDescriptionIds } from './Field';
import { Icon } from './Icon';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps<T extends string = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  label: React.ReactNode;
  options: readonly SelectOption<T>[];
  value?: T | '';
  defaultValue?: T | '';
  onChange?: (value: T) => void;
  /** First, non-selectable entry ("Choisir…"). */
  placeholder?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
}

function SelectFieldInner<T extends string = string>(
  { label, options, value, defaultValue, onChange, placeholder = 'Choisir…', hint, error, size = 'm', required, disabled, id, className = '', style, ...props }: SelectFieldProps<T>,
  ref: React.ForwardedRef<HTMLSelectElement>,
) {
  const generated = React.useId();
  const selectId = id ?? `select-${generated}`;
  return (
    <Field htmlFor={selectId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className} style={style}>
      <div className={`relative ${controlClass(Boolean(error))}`} style={controlStyle(size)}>
        <select
          {...props}
          ref={ref}
          id={selectId}
          value={value}
          defaultValue={value === undefined ? defaultValue ?? '' : undefined}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescriptionIds(selectId, hint, error)}
          onChange={(event) => onChange?.(event.target.value as T)}
          className="h-full w-full cursor-pointer appearance-none bg-transparent pr-8 outline-none"
          style={{ fontSize: 'inherit', minHeight: 'inherit' }}
        >
          <option value="" disabled={required}>{placeholder}</option>
          {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        <Icon icon={ChevronDown} size="s" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--mairie-muted)]" />
      </div>
    </Field>
  );
}

/** Single choice with label, hint and error (MAIR-608, Figma `Base/Select`): a native select, keyboard and form friendly. */
export const SelectField = React.forwardRef(SelectFieldInner) as <T extends string = string>(props: SelectFieldProps<T> & { ref?: React.ForwardedRef<HTMLSelectElement> }) => React.ReactElement;
