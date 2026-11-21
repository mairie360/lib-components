'use client';

import React from 'react';

import { CancelButton, SaveButton } from '../ButtonPresets';
import { componentMarker } from '../component-marker';

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
  /**
   * MAIR-1118: unsaved changes. `true` = the bar stands out (accent surface and border) with its buttons
   * enabled; `false` = both buttons disabled and the status reads « Aucune modification à enregistrer. »
   * unless `status` says otherwise (« 2 champs modifiés. »). Omitted, the bar looks as before.
   */
  dirty?: boolean;
  /** MAIR-1118: the bar sticks to the bottom of its scrolling container. */
  sticky?: boolean;
  /** Replaces the default Cancel + Save pair. */
  children?: React.ReactNode;
}

export const FORM_ACTIONS_CLEAN_STATUS = 'Aucune modification à enregistrer.';

/** Bottom bar of a form (MAIR-608, Figma `FormActions`): status on the left, Cancel + Save on the right. */
export const FormActions = ({ status, busy = false, saveDisabled = false, saveLabel, cancelLabel, onCancel, dirty, sticky = false, children, className = '', style, ...props }: FormActionsProps) => {
  const tracked = dirty !== undefined;
  const clean = dirty === false;
  const shownStatus = status ?? (clean ? FORM_ACTIONS_CLEAN_STATUS : null);
  const frame = dirty
    ? 'border border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]'
    : tracked ? `border border-transparent border-t-[var(--mairie-border)] ${sticky ? 'bg-[var(--mairie-surface)]' : ''}`
      : `border-t border-[var(--mairie-border)] ${sticky ? 'bg-[var(--mairie-surface)]' : ''}`;
  const box: React.CSSProperties = tracked
    ? { gap: 'var(--mairie-space-s)', padding: '12px 16px', borderRadius: dirty ? 'var(--mairie-radius-m)' : undefined, transitionProperty: 'background-color, border-color', transitionDuration: 'var(--mairie-motion-fast)', transitionTimingFunction: 'var(--mairie-ease-standard)' }
    : { gap: 'var(--mairie-space-s)', paddingTop: 'var(--mairie-space-m)' };
  return (
    <div {...props} {...componentMarker('FormActions', props)} data-dirty={tracked ? String(Boolean(dirty)) : undefined} data-sticky={sticky || undefined}
      className={`flex flex-wrap items-center justify-end ${frame} ${sticky ? 'sticky bottom-0 z-10' : ''} ${className}`.replace(/\s+/g, ' ').trim()} style={{ ...box, ...style }}>
      {/* Kept in the page while the dirty state is tracked, so the change of status is announced (polite). */}
      {shownStatus || tracked ? <p role="status" aria-live="polite" className="mr-auto text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{shownStatus}</p> : null}
      {children ?? (
        <>
          {onCancel ? <CancelButton label={cancelLabel} onClick={onCancel} disabled={busy || clean} /> : null}
          <SaveButton type="submit" label={saveLabel} loading={busy} disabled={saveDisabled || clean} />
        </>
      )}
    </div>
  );
};
