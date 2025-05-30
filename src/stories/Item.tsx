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

  const handleMainClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest("[role='button']")
      ) {
        return;
      }
      setShowActions(false);
      onClick?.();
    },
    [onClick]
  );

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
        className="relative mx-auto flex flex-col justify-between rounded-2xl border border-gray-600 bg-[#0f1117] px-4 py-3 text-white shadow-md transition hover:border-white cursor-pointer"
        style={{ width, height }}
        onClick={handleMainClick}
        role="button"
        tabIndex={0}
      >
        {/* Toggle Actions */}
        <div
          className="absolute top-2 right-2 z-50 flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions((prev) => !prev);
          }}
        >
          <MoreHorizontal size={20} className="text-white" />
        </div>

        {/* Content */}
        <div>
          {title && <h2 className="text-sm font-semibold truncate">{title}</h2>}
          {description && (
            <p className="text-xs text-gray-400 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-2 right-12 z-50 flex gap-2 items-center">
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              onPointerDown={(e) => e.stopPropagation()}
              className="group relative flex items-center rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 transition active:scale-95"
              aria-label="Modifier"
            >
              <Pencil size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-white text-black text-xs px-2 py-1 rounded-md shadow-md z-50">
                Modifier
              </span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDeleteClick}
              onPointerDown={(e) => e.stopPropagation()}
              className="group relative flex items-center rounded-xl bg-red-600 p-2 text-white hover:bg-red-700 transition active:scale-95"
              aria-label="Supprimer"
            >
              <Trash2 size={18} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-white text-black text-xs px-2 py-1 rounded-md shadow-md z-50">
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
