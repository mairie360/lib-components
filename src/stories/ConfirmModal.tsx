import React from "react";

export interface ConfirmModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
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
      <div className="rounded-xl p-6 w-full max-w-sm shadow-lg border-2">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="btn px-4 py-2 rounded-md btn-error transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
