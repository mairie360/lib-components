'use client';

import React from 'react';

import { TextField, type TextFieldProps } from './TextField';

export type FieldPresetProps = Omit<TextFieldProps, 'type' | 'label'> & { label?: React.ReactNode };

function preset(name: string, defaults: Partial<TextFieldProps> & { type: TextFieldProps['type'] }) {
  const Preset = React.forwardRef<HTMLInputElement, FieldPresetProps>(function Preset(props, ref) {
    // An explicit `undefined` keeps the preset default (label, placeholder, autocomplete).
    const overrides = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
    return <TextField ref={ref} {...defaults} label={defaults.label} data-preset={name} {...overrides} />;
  });
  Preset.displayName = `${name}Field`;
  return Preset;
}

/** Adresse e-mail: login, user forms, profile. */
export const EmailField = preset('Email', { type: 'email', label: 'Adresse e-mail', autoComplete: 'email', inputMode: 'email' });
/** Mot de passe with the visibility toggle. */
export const PasswordField = preset('Password', { type: 'password', label: 'Mot de passe', autoComplete: 'current-password' });
/** Rechercher: list toolbars; pass `onClear` for the clear button. */
export const SearchField = preset('Search', { type: 'search', label: 'Rechercher', placeholder: 'Rechercher…', autoComplete: 'off' });
/** Téléphone (French format accepted with spaces). */
export const PhoneField = preset('Phone', { type: 'tel', label: 'Téléphone', autoComplete: 'tel', inputMode: 'tel' });
/** Date in the instance time zone. */
export const DateField = preset('Date', { type: 'date', label: 'Date' });
/** Quantité / numeric value. */
export const NumberField = preset('Number', { type: 'number', label: 'Quantité', inputMode: 'numeric' });
/** Nom / prénom. */
export const NameField = preset('Name', { type: 'text', label: 'Nom', autoComplete: 'name' });

export const FieldPresets = { email: EmailField, password: PasswordField, search: SearchField, phone: PhoneField, date: DateField, number: NumberField, name: NameField } as const;
