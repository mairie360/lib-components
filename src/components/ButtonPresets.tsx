'use client';

import React from 'react';
import { Check, ChevronLeft, Download, LogOut, Pencil, Plus, RefreshCw, Send, Trash2, X } from 'lucide-react';

import { Button, type ButtonProps } from './Button';

/** A preset fixes the label, icon, variant and tone of a button role; every prop can still be overridden. */
export type ButtonPresetProps = Omit<ButtonProps, 'label'> & { label?: string };

function preset(name: string, defaults: Partial<Pick<ButtonProps, 'label' | 'icon' | 'variant' | 'tone'>>) {
  const Preset = React.forwardRef<HTMLButtonElement, ButtonPresetProps>(function Preset(props, ref) {
    return <Button ref={ref} {...defaults} data-preset={name} {...props} />;
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
/** Supprimer / Retirer: asks for a deletion, always followed by a ConfirmModal. */
export const DeleteButton = preset('Delete', { label: 'Supprimer', icon: Trash2, variant: 'outline', tone: 'danger' });
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
/** Déconnexion. */
export const LogoutButton = preset('Logout', { label: 'Déconnexion', icon: LogOut, variant: 'ghost', tone: 'danger' });

/** The presets by role, for consumers that pick one by name (`ButtonPresets.delete`). */
export const ButtonPresets = {
  create: CreateButton,
  save: SaveButton,
  cancel: CancelButton,
  edit: EditButton,
  delete: DeleteButton,
  confirmDelete: ConfirmDeleteButton,
  refresh: RefreshButton,
  retry: RetryButton,
  close: CloseButton,
  back: BackButton,
  send: SendButton,
  download: DownloadButton,
  logout: LogoutButton,
} as const;
