'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { Field, controlClass, fieldDescriptionIds } from './Field';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: Size;
}

const minHeights: Record<Size, number> = { xs: 64, s: 88, m: 112, l: 136, xl: 160 };

/** Multi-line field with the TextField anatomy (MAIR-608, Figma `Base/TextArea`). */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, size = 'm', required, disabled, id, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? `field-${generated}`;
  return (
    <Field htmlFor={inputId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className} style={style}>
      <textarea
        {...props}
        ref={ref}
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescriptionIds(inputId, hint, error)}
        className={`resize-y py-2 ${controlClass(Boolean(error))}`}
        style={{ minHeight: `${minHeights[size]}px`, fontSize: `var(--mairie-text-${size})`, paddingInline: 'var(--mairie-space-s)' }}
      />
    </Field>
  );
});
