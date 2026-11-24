'use client';

import React from 'react';
import { Check, ChevronLeft, Download, KeyRound, LogOut, Pencil, Plus, RefreshCw, Send, Trash2, X } from 'lucide-react';

import { Button, type ButtonProps } from '../Button';
import { componentMarker } from '../component-marker';

/** A preset fixes the label, icon, variant and tone of a button role; every prop can still be overridden. */
export type ButtonPresetProps = Omit<ButtonProps, 'label'> & { label?: string };

function preset(name: string, defaults: Partial<Pick<ButtonProps, 'label' | 'icon' | 'variant' | 'tone'>>) {
  const Preset = React.forwardRef<HTMLButtonElement, ButtonPresetProps>(function Preset(props, ref) {
    // An explicit `undefined` (e.g. `label={maybeLabel}`) keeps the preset default.
    const overrides = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
    return <Button ref={ref} {...defaults} data-preset={name} {...overrides} {...componentMarker(`${name}Button`, props)} />;
  });
  Preset.displayName = `${name}Button`;
  return Preset;
}

/** Créer / Nouveau: opens a creation form or modal. */
export const CreateButton = preset('Create', { label: 'Créer', icon: Plus, variant: 'solid', tone: 'primary' });
/** Enregistrer: submits a form; pass `loading` while saving. */
export const SaveButton = preset('Save', { label: 'Enregistrer', icon: Check, variant: 'solid', tone: 'primary' });
/** Annuler: leaves without saving. */
export const CancelButton = preset('Cancel', { label: 'Annuler', variant: 'outline', tone: 'neutral' });
/** Modifier: switches an item to edit mode. */
export const EditButton = preset('Edit', { label: 'Modifier', icon: Pencil, variant: 'outline', tone: 'neutral' });
/**
 * The red rule (MAIR-1095): red is kept for deletions, always on the danger tokens. Solid = critical
 * (ConfirmDeleteButton, inside the confirmation), outline = not critical (DeleteButton), ghost =
 * discreet (DeleteGhostButton, in a list or a toolbar).
 */
/** Supprimer / Retirer: asks for a deletion, always followed by a ConfirmModal. */
export const DeleteButton = preset('Delete', { label: 'Supprimer', icon: Trash2, variant: 'outline', tone: 'danger' });
/** MAIR-1095: Supprimer, discreet (Figma `Button/DeleteGhost`): a deletion inside a row, a card or a toolbar. */
export const DeleteGhostButton = preset('DeleteGhost', { label: 'Supprimer', icon: Trash2, variant: 'ghost', tone: 'danger' });
/** Confirmer la suppression: the final confirmation inside the dialog. */
export const ConfirmDeleteButton = preset('ConfirmDelete', { label: 'Confirmer la suppression', icon: Trash2, variant: 'solid', tone: 'danger' });
/** Actualiser: reloads the data of a panel. */
export const RefreshButton = preset('Refresh', { label: 'Actualiser', icon: RefreshCw, variant: 'outline', tone: 'neutral' });
/** Réessayer: retries after an error or unavailable state. */
export const RetryButton = preset('Retry', { label: 'Réessayer', icon: RefreshCw, variant: 'solid', tone: 'secondary' });
/** Fermer: closes a modal, drawer or notice. */
export const CloseButton = preset('Close', { label: 'Fermer', icon: X, variant: 'ghost', tone: 'neutral' });
/** Retour / Retour à la connexion. */
export const BackButton = preset('Back', { label: 'Retour', icon: ChevronLeft, variant: 'ghost', tone: 'neutral' });
/** Envoyer: sends a message or a request. */
export const SendButton = preset('Send', { label: 'Envoyer', icon: Send, variant: 'solid', tone: 'primary' });
/** Télécharger: downloads a file or an export. */
export const DownloadButton = preset('Download', { label: 'Télécharger', icon: Download, variant: 'outline', tone: 'secondary' });
/** MAIR-1071: Se connecter avec une passkey (Figma `Button/Passkey`): signs in with a WebAuthn credential. */
export const PasskeyButton = preset('Passkey', { label: 'Se connecter avec une passkey', icon: KeyRound, variant: 'outline', tone: 'secondary' });
/** MAIR-1071: Créer une passkey (Figma `Button/CreatePasskey`): registers a WebAuthn credential. */
export const CreatePasskeyButton = preset('CreatePasskey', { label: 'Créer une passkey', icon: KeyRound, variant: 'solid', tone: 'primary' });
/** Déconnexion. */
export const LogoutButton = preset('Logout', { label: 'Déconnexion', icon: LogOut, variant: 'ghost', tone: 'danger' });

/** The presets by role, for consumers that pick one by name (`ButtonPresets.delete`). */
export const ButtonPresets = {
  create: CreateButton,
  save: SaveButton,
  cancel: CancelButton,
  edit: EditButton,
  delete: DeleteButton,
  deleteGhost: DeleteGhostButton,
  confirmDelete: ConfirmDeleteButton,
  refresh: RefreshButton,
  retry: RetryButton,
  close: CloseButton,
  back: BackButton,
  send: SendButton,
  download: DownloadButton,
  logout: LogoutButton,
  passkey: PasskeyButton,
  createPasskey: CreatePasskeyButton,
} as const;
