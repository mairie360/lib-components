'use client';

import React, { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

import { CancelButton, ConfirmDeleteButton } from '../ButtonPresets';
import { Button } from '../Button';
import { Modal, type ModalProps } from '../Modal';
import { Body } from '../Text';
import { componentMarker } from '../component-marker';

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer' | 'open' | 'onClose'> {
  /** Defaults to `onCancel`. */
  onClose?: () => void;
  /** Question or consequence shown to the user. */
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  /** @deprecated use `open`. */
  isOpen?: boolean;
  open?: boolean;
  /** « Supprimer » by default; `destructive=false` gives a primary confirm button. */
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Disables both buttons and shows a spinner on confirm while the request runs. */
  busy?: boolean;
  /** Icon of the primary confirm button (`destructive={false}`), e.g. LogOut. */
  confirmIcon?: LucideIcon;
  /** Initial focus: the first control (default) or « Annuler », the safe choice (MAIR-834). */
  initialFocus?: 'first' | 'cancel';
}

/** Confirmation of an irreversible action, on `Modal` size xs (MAIR-608, Figma `Modal/Confirm`). */
export const ConfirmModal = ({ message, onCancel, onConfirm, isOpen, open = isOpen ?? false, confirmLabel, cancelLabel, destructive = true, busy = false, onClose = onCancel, size = 'xs', closeOnBackdrop = true, confirmIcon, initialFocus = 'first', initialFocusRef, ...props }: ConfirmModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    // While the request runs, Escape, the backdrop and the header close cannot dismiss the dialog.
    <Modal {...props} {...componentMarker('ConfirmModal', props)} open={open} size={size} onClose={busy ? () => undefined : onClose} closeOnBackdrop={closeOnBackdrop && !busy}
      initialFocusRef={initialFocusRef ?? (initialFocus === 'cancel' ? cancelRef : undefined)} footer={<>
      <CancelButton ref={cancelRef} label={cancelLabel} onClick={onCancel} disabled={busy} />
      {destructive ? <ConfirmDeleteButton label={confirmLabel} onClick={onConfirm} loading={busy} /> : <Button label={confirmLabel ?? 'Confirmer'} icon={confirmIcon} onClick={onConfirm} loading={busy} />}
    </>}>
      <Body>{message}</Body>
    </Modal>
  );
};
