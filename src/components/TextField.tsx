'use client';

import React from 'react';
import { Calendar, Eye, EyeOff, Lock, Mail, Phone, Search, X, type LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Field, controlClass, controlStyle, fieldDescriptionIds } from './Field';
import { Icon } from './Icon';

export type TextFieldType = 'text' | 'password' | 'email' | 'search' | 'number' | 'date' | 'tel';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  type?: TextFieldType;
  size?: Size;
  /** Overrides the icon the type implies (mail, lock, phone, calendar, search). */
  icon?: LucideIcon | null;
  /** Search fields: called when the clear button is pressed (shown while a value is present). */
  onClear?: () => void;
  /** Extra control rendered after the input, inside the box. */
  trailing?: React.ReactNode;
}

const typeIcons: Partial<Record<TextFieldType, LucideIcon>> = { email: Mail, password: Lock, tel: Phone, date: Calendar, search: Search };

/**
 * Single-line field with label, hint, error and required marker (MAIR-608, Figma
 * `Base/TextField`). Forwards its ref and spreads native props, so it works as-is
 * with react-hook-form's `register`. Prefer the presets (EmailField, PasswordField…).
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, type = 'text', size = 'm', icon, onClear, trailing, required, disabled, id, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `field-${generated}`;
  const [revealed, setRevealed] = React.useState(false);
  const leading = icon === null ? null : icon ?? typeIcons[type];
  const inputType = type === 'password' && revealed ? 'text' : type;
  const showClear = type === 'search' && Boolean(onClear) && Boolean(props.value ?? props.defaultValue);
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className} style={style}>
      <div className={`flex items-center gap-2 ${controlClass(Boolean(error))}`} style={controlStyle(size)} data-type={type}>
        {leading ? <Icon icon={leading} size={size === 'xl' ? 'l' : size === 'xs' ? 'xs' : 's'} className="text-[var(--mairie-muted)]" /> : null}
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={inputType}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescriptionIds(inputId, hint, error)}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--mairie-muted)]"
          style={{ fontSize: 'inherit', height: '100%' }}
        />
        {type === 'password' ? (
          <button type="button" aria-label={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={revealed} onClick={() => setRevealed((value) => !value)} disabled={disabled} className="inline-flex items-center justify-center rounded-[var(--mairie-radius-s)] text-[var(--mairie-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]" style={{ width: 'var(--mairie-control-xs)', height: 'var(--mairie-control-xs)' }}>
            <Icon icon={revealed ? EyeOff : Eye} size="s" />
          </button>
        ) : null}
        {showClear ? (
          <button type="button" aria-label="Effacer la recherche" onClick={onClear} disabled={disabled} className="inline-flex items-center justify-center rounded-[var(--mairie-radius-s)] text-[var(--mairie-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]" style={{ width: 'var(--mairie-control-xs)', height: 'var(--mairie-control-xs)' }}>
            <Icon icon={X} size="s" />
          </button>
        ) : null}
        {trailing}
      </div>
    </Field>
  );
});
