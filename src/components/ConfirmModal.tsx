import React from "react";

export interface ConfirmModalProps {
  /** Titre de la fenêtre de confirmation */
  title: string;
  /** Contenu du message de confirmation */
  message: string;
  /** Fonction appelée au clic sur le bouton d’annulation */
  onCancel: () => void;
  /** Fonction appelée au clic sur le bouton de confirmation */
  onConfirm: () => void;
  /** Indique si la fenêtre est ouverte */
  isOpen: boolean;
  /** Libellé du bouton de confirmation */
  confirmLabel?: string;
  /** Libellé du bouton d’annulation */
  cancelLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onCancel,
  onConfirm,
  isOpen,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
}) => {
  const titleId = React.useId();
  const messageId = React.useId();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={messageId}
    >
      <div className="rounded-xl p-6 w-full max-w-sm shadow-lg border-2 bg-[#f5f3f0]">
        <h2 id={titleId} className="text-lg font-bold mb-4 text-gray-900">{title}</h2>
        <div className="h-px w-full bg-[#d1cfc9] mb-4" />
        <p id={messageId} className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-error bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
