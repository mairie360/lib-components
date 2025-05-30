import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { SortableItem } from "./SortableItem";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type ItemData = {
  id: string;
  title: string;
  description?: string;
};

type ItemContainerProps = {
  title: string;
  statusColor?: string;
  items: ItemData[];
  onAddItem?: (title: string) => void;
  onItemClick?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onItemReorder?: (newItems: ItemData[]) => void;
};

const statusColors = [
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
];

export const ItemContainer: React.FC<ItemContainerProps> = ({
  title,
  statusColor = "bg-green-500",
  items,
  onAddItem,
  onItemClick,
  onItemDelete,
  onItemEdit,
  onTitleChange,
  onItemReorder,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [search, setSearch] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedStatusColor, setSelectedStatusColor] = useState(statusColor);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleTitleEdit = () => {
    if (isEditingTitle && editedTitle.trim()) {
      onTitleChange?.(editedTitle);
    }
    setIsEditingTitle((prev) => !prev);
  };

  // Drag & Drop setup
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onItemReorder?.(newItems);
    }
  };

  // Filter items by search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Inline add new item
  const handleAddNewItem = () => {
    if (newItemTitle.trim()) {
      onAddItem?.(newItemTitle.trim());
      setNewItemTitle("");
    }
  };

  // Menu actions
  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all items?")) {
      items.forEach((item) => onItemDelete?.(item.id));
    }
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.json";
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  return (
    <section
      className="relative mx-auto w-[380px] min-h-[600px] rounded-xl border border-white-900 bg-[#0f1117] p-3 flex flex-col"
      role="region"
      aria-labelledby="item-container-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`${selectedStatusColor} w-3 h-3 rounded-full cursor-pointer`}
            aria-hidden="true"
            title="Change status color"
            onClick={() => {
              const currentIndex = statusColors.indexOf(selectedStatusColor);
              const nextIndex = (currentIndex + 1) % statusColors.length;
              const nextColor = statusColors[nextIndex];
              setSelectedStatusColor(nextColor);
              // Optionally notify parent or store color
            }}
          />
          {isEditingTitle ? (
            <>
              <label htmlFor="edit-title" className="sr-only">
                Edit title
              </label>
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
            <>
              <h2
                id="item-container-title"
                className="text-white font-semibold text-lg cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
              >
                {title} <span className="text-gray-400 text-sm">({items.length})</span>
              </h2>
            </>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="p-1 rounded hover:bg-white/10 transition"
            aria-label="Open container menu"
          >
            <MoreHorizontal size={20} className="text-white" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#1c1f26] rounded-md shadow-lg w-40 z-100 border border-gray-700">
              <button
                onClick={handleDeleteAll}
                className="w-full text-left px-3 py-2 hover:bg-red-700 text-red-600 rounded-t-md"
              >
                Delete All Items
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-3 py-2 hover:bg-blue-700 text-blue-500 rounded-b-md"
              >
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 bg-[#1a1d24] text-sm text-white px-2 py-1 rounded focus:outline-none"
        aria-label="Search items"
      />

      {/* Items list with drag & drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div
            className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1"
            role="list"
            aria-label="Item list"
          >
            {filteredItems.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                onClick={() => onItemClick?.(item.id)}
                onDelete={() => onItemDelete?.(item.id)}
                onEdit={() => onItemEdit?.(item.id)}
              />
            ))}

          </div>
        </SortableContext>
      </DndContext>

      {/* Add new item inline */}
      <div className="mt-2 flex gap-2 items-center">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNewItem();
            }
          }}
          placeholder="Add new item..."
          className="flex-grow bg-transparent border-b border-gray-500 text-white focus:outline-none px-2 py-1 rounded"
          aria-label="Add new item"
        />
        <button
          onClick={handleAddNewItem}
          className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition text-white"
          aria-label="Add item"
        >
          +
        </button>
      </div>
    </section>
  );
};
