'use client';

import React from 'react';

import { TextField, type TextFieldProps } from '../TextField';
import { componentMarker } from '../component-marker';
import { NEW_PASSWORD_HINT } from '../../kit/password';

export type FieldPresetProps = Omit<TextFieldProps, 'type' | 'label'> & { label?: React.ReactNode };

function preset(name: string, defaults: Partial<TextFieldProps> & { type: TextFieldProps['type'] }) {
  const Preset = React.forwardRef<HTMLInputElement, FieldPresetProps>(function Preset(props, ref) {
    // An explicit `undefined` keeps the preset default (label, placeholder, autocomplete).
    const overrides = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
    return <TextField ref={ref} {...defaults} label={defaults.label} data-preset={name} {...overrides} {...componentMarker(`${name}Field`, props)} />;
  });
  Preset.displayName = `${name}Field`;
  return Preset;
}

/** Adresse e-mail: login, user forms, profile. */
export const EmailField = preset('Email', { type: 'email', label: 'Adresse e-mail', autoComplete: 'email', inputMode: 'email' });
/** Mot de passe with the visibility toggle. */
export const PasswordField = preset('Password', { type: 'password', label: 'Mot de passe', autoComplete: 'current-password' });
/**
 * MAIR-837: « Nouveau mot de passe » (first connection, reset, change): new-password autocomplete and the
 * rule as help text. Check the value with `checkNewPassword` (`@mairie360/lib-components/shared`) and pass
 * its message as `error`.
 */
export const NewPasswordField = preset('NewPassword', { type: 'password', label: 'Nouveau mot de passe', autoComplete: 'new-password', hint: NEW_PASSWORD_HINT });
/** Rechercher: list toolbars; pass `onClear` for the clear button. */
export const SearchField = preset('Search', { type: 'search', label: 'Rechercher', placeholder: 'Rechercher…', autoComplete: 'off' });
/** Téléphone (French format accepted with spaces). */
export const PhoneField = preset('Phone', { type: 'tel', label: 'Téléphone', autoComplete: 'tel', inputMode: 'tel' });
/** Date in the instance time zone. */
export const DateField = preset('Date', { type: 'date', label: 'Date' });
/** MAIR-839: Heure (`min`, `max`, `step` are passed to the native input). */
export const TimeField = preset('Time', { type: 'time', label: 'Heure' });
/** Quantité / numeric value. */
export const NumberField = preset('Number', { type: 'number', label: 'Quantité', inputMode: 'numeric' });
/** Nom / prénom. */
export const NameField = preset('Name', { type: 'text', label: 'Nom', autoComplete: 'name' });

export const FieldPresets = { email: EmailField, password: PasswordField, newPassword: NewPasswordField, time: TimeField, search: SearchField, phone: PhoneField, date: DateField, number: NumberField, name: NameField } as const;
