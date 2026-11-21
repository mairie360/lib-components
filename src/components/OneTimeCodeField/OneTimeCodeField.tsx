'use client';

import React from 'react';
import { LifeBuoy, Smartphone } from 'lucide-react';

import { normalizeRecoveryCode, normalizeTotpCode, TOTP_CODE_LENGTH } from '../../kit/one-time-code';
import { TextField, type TextFieldProps } from '../TextField';
import { componentMarker } from '../component-marker';

export type OneTimeCodeKind = 'totp' | 'recovery';

export interface OneTimeCodeFieldProps extends Omit<TextFieldProps, 'type' | 'icon' | 'label' | 'onClear' | 'trailing'> {
  /** `totp`: the 6 digits of the authenticator app; `recovery`: a code of the recovery list (`A1B2-C3D4`). */
  kind?: OneTimeCodeKind;
  label?: React.ReactNode;
  /** Called with the cleaned value after each change (digits only, or `A1B2-C3D4`). */
  onValueChange?: (value: string) => void;
  /** TOTP only: called once the sixth digit is typed or pasted, so the form can submit. */
  onComplete?: (value: string) => void;
}

const kinds = {
  totp: { label: 'Code à 6 chiffres', placeholder: '123 456', icon: Smartphone, normalize: normalizeTotpCode, maxLength: TOTP_CODE_LENGTH, inputMode: 'numeric' as const, autoComplete: 'one-time-code', hint: 'Saisissez le code affiché par votre application d’authentification.' },
  recovery: { label: 'Code de secours', placeholder: 'A1B2-C3D4', icon: LifeBuoy, normalize: normalizeRecoveryCode, maxLength: 9, inputMode: 'text' as const, autoComplete: 'off', hint: 'Chaque code de secours ne sert qu’une fois.' },
};

/**
 * Field for a one-time code (MAIR-1067, Figma `Field/OneTimeCode`): the authenticator code (6 digits, spaced
 * placeholder, numeric keypad, `autocomplete="one-time-code"`) or a recovery code (`A1B2-C3D4`, monospace).
 * Typed and pasted text is cleaned on the way in (spaces, dashes, case), so the value is always ready to send.
 * Works controlled, uncontrolled or with react-hook-form `register`. `error` is the Figma `State=Error` (MAIR-1104):
 * red border, the message in place of the hint, `aria-invalid` and `aria-describedby` on the code, like `TextField`.
 */
export const OneTimeCodeField = React.forwardRef<HTMLInputElement, OneTimeCodeFieldProps>(function OneTimeCodeField(
  { kind = 'totp', label, hint, placeholder, onChange, onValueChange, onComplete, className = '', style, ...props },
  ref,
) {
  const config = kinds[kind];
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = config.normalize(event.target.value);
    if (event.target.value !== cleaned) event.target.value = cleaned;
    onChange?.(event);
    onValueChange?.(cleaned);
    if (kind === 'totp' && cleaned.length === TOTP_CODE_LENGTH) onComplete?.(cleaned);
  };
  return (
    <TextField
      {...props}
      {...componentMarker('OneTimeCodeField', props)}
      ref={ref}
      type="text"
      icon={config.icon}
      label={label ?? config.label}
      hint={hint ?? config.hint}
      placeholder={placeholder ?? config.placeholder}
      inputMode={config.inputMode}
      autoComplete={config.autoComplete}
      maxLength={config.maxLength}
      spellCheck={false}
      autoCapitalize="characters"
      data-kind={kind}
      onChange={handleChange}
      className={`${kind === 'recovery' ? 'font-mono' : 'tracking-[0.2em]'} ${className}`.trim()}
      style={style}
    />
  );
});
