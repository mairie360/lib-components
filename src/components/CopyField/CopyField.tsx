'use client';

import React from 'react';
import { Check, Copy } from 'lucide-react';

import { IconButton } from '../IconButton';
import { componentMarker } from '../component-marker';
import { selectContent, useCopyFeedback } from '../clipboard';

export interface CopyFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: React.ReactNode;
  /** The text that is copied. */
  value: string;
  /** What is shown instead of `value` (grouped by 4 characters, for example); `value` is still what is copied. */
  display?: string;
  /** Accessible name of the button (« Copier » by default). */
  copyLabel?: string;
  /** Feedback shown and announced after a copy (« Copié » by default). */
  copiedLabel?: string;
  /** Called after the text reached the clipboard. */
  onCopy?: () => void;
  /** Keeps the label for assistive technologies only, when the surroundings already show one (a description list). */
  hideLabel?: boolean;
}

/**
 * Read-only value with a « Copier » button (MAIR-1069, Figma `Base/CopyField`): monospace, selectable, a check
 * and « Copié » for about 1.5 s, announced in a polite live region. When the browser refuses the clipboard
 * the text is selected so that it can be copied by hand. Extracted from `SessionDetails`; used for the TOTP key.
 */
export function CopyField({ label, value, display, copyLabel = 'Copier', copiedLabel = 'Copié', onCopy, hideLabel = false, className = '', style, ...props }: CopyFieldProps) {
  const labelId = React.useId();
  const valueRef = React.useRef<HTMLElement>(null);
  const { copied, copy } = useCopyFeedback({ onCopy });
  const [refused, setRefused] = React.useState(false);
  const handleCopy = async () => {
    const done = await copy(value);
    setRefused(!done);
    if (!done) selectContent(valueRef.current);
  };
  return (
    <div {...props} {...componentMarker('CopyField', props)} className={`flex min-w-0 flex-col ${className}`.trim()} style={{ gap: 'var(--mairie-space-xs)', ...style }}>
      <span id={labelId} className={hideLabel ? 'sr-only' : 'font-medium text-[var(--mairie-text)]'} style={hideLabel ? undefined : { fontSize: 'var(--mairie-text-m)' }}>{label}</span>
      <div className="flex min-w-0 items-center border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)]" style={{ gap: 'var(--mairie-space-s)', borderRadius: 'var(--mairie-radius-m)', padding: 'var(--mairie-space-xs) var(--mairie-space-xs) var(--mairie-space-xs) var(--mairie-space-s)' }}>
        <code ref={valueRef} aria-labelledby={labelId} className="min-w-0 flex-1 select-all break-all font-mono text-[var(--mairie-text)]" style={{ fontSize: 'var(--mairie-text-m)' }}>{display ?? value}</code>
        {copied ? <span aria-hidden="true" className="shrink-0 font-medium text-[var(--mairie-success-text)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{copiedLabel}</span> : null}
        <IconButton icon={copied ? Check : Copy} label={copyLabel} size="s" onClick={() => { void handleCopy(); }} />
      </div>
      <span role="status" aria-live="polite" className="sr-only">{copied ? copiedLabel : refused ? 'Copie impossible : le texte est sélectionné, copiez-le avec Ctrl+C.' : ''}</span>
    </div>
  );
}
