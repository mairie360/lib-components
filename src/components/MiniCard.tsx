import React, { useState, useCallback, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { ConfirmModal } from "./ConfirmModal";

type MiniCardProps = {
  title?: string;
  description?: string;
  width?: string;
  height?: string;
  label?: string;
  onOpen?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

export const MiniCard: React.FC<MiniCardProps> = ({
  title,
  description,
  width = "320px",
  height = "auto",
  label = "Ouvrir la carte",
  onOpen,
  onClick,
  onDelete,
  onEdit,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleAction = useCallback(
    (action?: () => void) => (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setShowActions(false);
      action?.();
    },
    []
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setShowDeleteModal(true);
  };

  const handleCardClick = () => {
    setShowActions(false);
    onClick?.();
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div
          ref={cardRef}
          role="group"
          aria-label={`Carte projet : ${title}`}
          className="relative flex flex-col items-center text-center rounded-2xl border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6 shadow-md hover:shadow-lg hover:border-[var(--mairie-surface)]/30 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--mairie-surface)]/50"
          style={{ width, height }}

        >
          <button type="button" aria-label={`Carte projet : ${title}`}
            className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
            onClick={handleCardClick} />
          {/* Options button */}
          <button
            aria-label="Afficher plus d’options"
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-[var(--mairie-surface-raised)] transition"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((prev) => !prev);
            }}
          >
            <MoreHorizontal size={20} className="text-[var(--mairie-text)]" />
          </button>

          {/* Title & Description */}
          <h3 className="relative pointer-events-none text-lg font-bold mb-2 text-[var(--mairie-text)]">{title}</h3>
          <p className="relative pointer-events-none text-sm text-[var(--mairie-muted)] mb-4">{description}</p>

          {/* Action menu */}
          {showActions && (
            <div className="absolute top-12 right-3 z-50 flex flex-col gap-2">
              <button
                onClick={handleAction(onEdit)}
                aria-label="Modifier"
                className="p-2 rounded-md text-[var(--mairie-on-action)] bg-[var(--mairie-action-background)] hover:bg-[var(--mairie-action-hover-background)] transition"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDeleteClick}
                aria-label="Supprimer"
                className="p-2 rounded-md text-[var(--mairie-on-action)] bg-[var(--mairie-error-action-background)] hover:bg-[var(--mairie-error-action-hover-background)] transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* CTA Button */}
          <div className="relative mt-6">
            <Button label={label} primary onClick={onOpen} />
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmer la suppression"
        message={`Es-tu sûr de vouloir supprimer « ${title} » ?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete?.();
        }}
      />
    </>
  );
};
