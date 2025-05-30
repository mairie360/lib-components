import React, { useState, useCallback, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "./Button";

type MiniCardProps = {
  title?: string;
  description?: string;
  width?: string;
  height?: string;
  label?: string;
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
  onClick,
  onDelete,
  onEdit,
}) => {
  const [showActions, setShowActions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setShowActions(false);
        onClick?.();
      }
    },
    [onClick]
  );

  return (
    <div className="w-full flex justify-center">
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Project card: ${title}`}
        onClick={() => {
          setShowActions(false);
          onClick?.();
        }}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col items-center text-center rounded-2xl border border-gray-700 bg-[#0f1117] p-6 shadow-md hover:shadow-lg hover:border-white/30 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
        style={{ width, height }}
      >
        {/* Options button */}
        <button
          aria-label="Show more options"
          className="absolute top-3 right-3 rounded-full p-1 hover:bg-white/10 transition"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          <MoreHorizontal size={20} className="text-white" />
        </button>

        {/* Title & description */}
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>

        {/* Actions */}
        {showActions && (
          <div className="absolute mt-5 right-2.5 flex flex-col gap-2 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              aria-label="Edit project"
              className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              aria-label="Delete project"
              className="p-2 rounded-md bg-red-600 hover:bg-red-700 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6">
          <Button label={label} primary />
        </div>
      </div>
    </div>
  );
};
