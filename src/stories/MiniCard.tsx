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
  label = "Open Mini Card",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={`Project card: ${title}`}
          className="relative flex flex-col items-center text-center rounded-2xl border border-gray-700 bg-[#0f1117] p-6 shadow-md hover:shadow-lg hover:border-white/30 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ width, height }}
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
        >
          {/* Options button */}
          <button
            aria-label="Show more options"
            className="absolute top-3 right-3 rounded-full p-1 hover:bg-white/10 transition"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((prev) => !prev);
            }}
          >
            <MoreHorizontal size={20} className="text-white" />
          </button>

          {/* Title & Description */}
          <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
          <p className="text-sm text-gray-400 mb-4">{description}</p>

          {/* Action menu */}
          {showActions && (
            <div className="absolute top-12 right-3 z-50 flex flex-col gap-2">
              <button
                onClick={handleAction(onEdit)}
                aria-label="Edit"
                className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDeleteClick}
                aria-label="Delete"
                className="p-2 rounded-md bg-red-600 hover:bg-red-700 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-6">
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
