'use client';

import React from 'react';

import { CancelButton, ConfirmDeleteButton } from './ButtonPresets';
import { Button } from './Button';
import { Modal, type ModalProps } from './Modal';
import { Body } from './Text';

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
}

/** Confirmation of an irreversible action, on `Modal` size xs (MAIR-608, Figma `Modal/Confirm`). */
export const ConfirmModal = ({ message, onCancel, onConfirm, isOpen, open = isOpen ?? false, confirmLabel, cancelLabel, destructive = true, busy = false, onClose = onCancel, size = 'xs', ...props }: ConfirmModalProps) => (
  <Modal {...props} open={open} size={size} onClose={onClose} footer={<>
    <CancelButton label={cancelLabel} onClick={onCancel} disabled={busy} />
    {destructive ? <ConfirmDeleteButton label={confirmLabel} onClick={onConfirm} loading={busy} /> : <Button label={confirmLabel ?? 'Confirmer'} onClick={onConfirm} loading={busy} />}
  </>}>
    <Body>{message}</Body>
  </Modal>
);
