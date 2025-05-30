import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Item } from "./Item";

type ItemData = {
  id: string;
  title: string;
  description?: string;
};

type ItemContainerProps = {
  title: string;
  statusColor?: string;
  items: ItemData[];
  onAddItem?: () => void;
  onItemClick?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onTitleChange?: (newTitle: string) => void;
};

export const ItemContainer: React.FC<ItemContainerProps> = ({
  title,
  statusColor = "bg-green-500",
  items,
  onAddItem,
  onItemClick,
  onItemDelete,
  onItemEdit,
  onTitleChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleEdit = () => {
    if (isEditingTitle && editedTitle.trim()) {
      onTitleChange?.(editedTitle);
    }
    setIsEditingTitle((prev) => !prev);
  };

  return (
    <section
      className="relative mx-auto w-[380px] min-h-[600px] rounded-xl border border-white-900 bg-[#0f1117] p-3 flex flex-col justify-between"
      role="region"
      aria-labelledby="item-container-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColor}`} aria-hidden="true" />
          {isEditingTitle ? (
            <>
              <label htmlFor="edit-title" className="sr-only">Edit title</label>
              <input
                id="edit-title"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleEdit();
                }}
                className="bg-transparent border-b border-gray-500 text-white focus:outline-none"
                autoFocus
                aria-label="Edit container title"
              />
            </>
          ) : (
            <h2 id="item-container-title" className="text-white font-semibold text-lg">
              {title}
            </h2>
          )}
        </div>
        <button
          onClick={handleTitleEdit}
          className="p-1 rounded hover:bg-white/10 transition"
          aria-label={isEditingTitle ? "Save title" : "Edit title"}
        >
          <Pencil size={16} className="text-white" />
        </button>
      </div>

      {/* Items */}
      <div
        className="flex flex-col gap-3 overflow-y-auto flex-1 mb-4 pr-1"
        role="list"
        aria-label="Item list"
      >
        {items.map((item) => (
          <Item
            key={item.id}
            title={item.title}
            description={item.description}
            onClick={() => onItemClick?.(item.id)}
            onDelete={() => onItemDelete?.(item.id)}
            onEdit={() => onItemEdit?.(item.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={onAddItem}
        className="flex items-center justify-center gap-2 text-white hover:text-gray-300 text-sm py-2 mt-auto"
        aria-label="Add item"
      >
        <span className="text-xl leading-none" aria-hidden="true">＋</span> Add items
      </button>
    </section>
  );
};
