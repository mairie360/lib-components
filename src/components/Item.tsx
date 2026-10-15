import React, { useState, useCallback, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

type ItemProps = {
  title?: string;
  description?: string;
  width?: string;
  height?: string;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  id?: string;
};

export const Item: React.FC<ItemProps> = ({
  title,
  description,
  width = "320px",
  height = "80px",
  onClick,
  onDelete,
  onEdit,
  id = "",
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setShowActions(false);
      onEdit?.();
    },
    [onEdit]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setShowActions(false);
      setShowDeleteModal(true);
    },
    []
  );

  const confirmDelete = () => {
    setShowDeleteModal(false);
    onDelete?.();
  };

  return (
    <>
      <div
        key={id}
        ref={itemRef}
        className="relative mx-auto flex flex-col justify-between rounded-2xl border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 py-3 text-[var(--mairie-text)] shadow-md transition hover:border-[var(--mairie-surface)] cursor-pointer"
        style={{ width, height }}
        role="group"
        aria-label={title || "Élément"}
      >
        <button type="button" aria-label={title ? `Ouvrir ${title}` : 'Ouvrir l’élément'}
          className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
          onClick={() => { setShowActions(false); onClick?.(); }} />
        {/* Toggle Actions */}
        <button
          type="button"
          aria-label="Afficher plus d’options"
          aria-expanded={showActions}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--mairie-surface-raised)] transition"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions((prev) => !prev);
          }}
        >
          <MoreHorizontal size={20} className="text-[var(--mairie-text)]" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="pointer-events-none relative">
          {title && <h2 className="text-sm font-semibold truncate">{title}</h2>}
          {description && (
            <p className="text-xs text-[var(--mairie-muted)] line-clamp-2">{description}</p>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-2 right-12 z-10 flex gap-2 items-center">
            <button
              onClick={handleEdit}
              onPointerDown={(e) => e.stopPropagation()}
              className="group relative flex items-center rounded-xl bg-[var(--mairie-action-background)] p-2 text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)] transition active:scale-95"
              aria-label="Modifier"
            >
              <Pencil size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-[var(--mairie-surface)] text-[var(--mairie-text)] text-xs px-2 py-1 rounded-md shadow-md z-10">
                Modifier
              </span>
            </button>

            <button
              onClick={handleDeleteClick}
              onPointerDown={(e) => e.stopPropagation()}
              className="group relative flex items-center rounded-xl bg-[var(--mairie-error-action-background)] p-2 text-[var(--mairie-on-action)] hover:bg-[var(--mairie-error-action-hover-background)] transition active:scale-95"
              aria-label="Supprimer"
            >
              <Trash2 size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-[var(--mairie-surface)] text-[var(--mairie-text)] text-xs px-2 py-1 rounded-md shadow-md z-10">
                Supprimer
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirmer la suppression"
        message={`Es-tu sûr de vouloir supprimer « ${title} » ?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};
