import React from "react";

export interface ConfirmModalProps {
  /** Title of the confirmation modal */
  title: string;
  /** Message content of the confirmation modal */
  message: string;
  /** Callback function when the cancel button is clicked */
  onCancel: () => void;
  /** Callback function when the confirm button is clicked */
  onConfirm: () => void;
  /** Whether the modal is open or not */
  isOpen: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onCancel,
  onConfirm,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="rounded-xl p-6 w-full max-w-sm shadow-lg border-2 bg-[#f5f3f0]">
        <h2 className="text-lg font-bold mb-4 text-gray-900">{title}</h2>
        <div className="h-px w-full bg-[#d1cfc9] mb-4" />
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-error bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
