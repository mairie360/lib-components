'use client';

import React from 'react';

import { CancelButton, SaveButton } from '../ButtonPresets';

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Status text on the left ("Aucune modification à enregistrer.", "Enregistré."). */
  status?: React.ReactNode;
  /** Shown while the form submits: the save button spins, cancel is disabled. */
  busy?: boolean;
  /** Disables the save button (pristine or invalid form). */
  saveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  /** Replaces the default Cancel + Save pair. */
  children?: React.ReactNode;
}

/** Bottom bar of a form (MAIR-608, Figma `FormActions`): status on the left, Cancel + Save on the right. */
export const FormActions = ({ status, busy = false, saveDisabled = false, saveLabel, cancelLabel, onCancel, children, className = '', style, ...props }: FormActionsProps) => (
  <div {...props} className={`flex flex-wrap items-center justify-end border-t border-[var(--mairie-border)] ${className}`.trim()} style={{ gap: 'var(--mairie-space-s)', paddingTop: 'var(--mairie-space-m)', ...style }}>
    {status ? <p role="status" className="mr-auto text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{status}</p> : null}
    {children ?? (
      <>
        {onCancel ? <CancelButton label={cancelLabel} onClick={onCancel} disabled={busy} /> : null}
        <SaveButton type="submit" label={saveLabel} loading={busy} disabled={saveDisabled} />
      </>
    )}
  </div>
);
