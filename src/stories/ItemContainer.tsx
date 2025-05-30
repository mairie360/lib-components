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
  description?: string;
  statusColor?: string;
  items: ItemData[];
  onAddItem?: (title: string) => void;
  onItemClick?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onTitleChange?: (newTitle: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
  onStatusColorChange?: (newColor: string) => void;
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
  description = "",
  statusColor = "bg-green-500",
  items,
  onAddItem,
  onItemClick,
  onItemDelete,
  onItemEdit,
  onTitleChange,
  onDescriptionChange,
  onStatusColorChange,
  onItemReorder,
}) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [selectedStatusColor, setSelectedStatusColor] = useState(statusColor);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  const [search, setSearch] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");

  const [sortedItems, setSortedItems] = useState<ItemData[]>(items);

  useEffect(() => setEditedTitle(title), [title]);
  useEffect(() => setEditedDescription(description), [description]);
  useEffect(() => setSelectedStatusColor(statusColor), [statusColor]);
  useEffect(() => setSortedItems(items), [items]);

  const menuRef = useRef<HTMLDivElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (menuRef.current && !menuRef.current.contains(event.target as Node)) &&
        (editMenuRef.current && !editMenuRef.current.contains(event.target as Node))
      ) {
        setShowMenu(false);
        setShowEditMenu(false);
      }
    }
    if (showMenu || showEditMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, showEditMenu]);

  const saveEdits = () => {
    if (editedTitle.trim()) onTitleChange?.(editedTitle.trim());
    onDescriptionChange?.(editedDescription.trim());
    onStatusColorChange?.(selectedStatusColor);
    setShowEditMenu(false);
    setShowMenu(false);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((i) => i.id === active.id);
      const newIndex = sortedItems.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(sortedItems, oldIndex, newIndex);
      setSortedItems(newItems);
      onItemReorder?.(newItems);
    }
  };

  const filteredItems = sortedItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNewItem = () => {
    if (newItemTitle.trim()) {
      onAddItem?.(newItemTitle.trim());
      setNewItemTitle("");
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all items?")) {
      sortedItems.forEach((item) => onItemDelete?.(item.id));
    }
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sortedItems, null, 2);
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
              onStatusColorChange?.(nextColor);
            }}
          />
          <h2
            id="item-container-title"
            className="text-white font-semibold text-lg cursor-default"
          >
            {editedTitle}{" "}
            <span className="text-gray-400 text-sm">({items.length})</span>
          </h2>
        </div>

        {/* Menu contextuel */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowMenu((v) => !v);
              setShowEditMenu(false);
            }}
            className="p-1 rounded hover:bg-white/10 transition"
            aria-label="Open container menu"
          >
            <MoreHorizontal size={20} className="text-white" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#1c1f26] rounded-md shadow-lg w-40 z-100 border border-gray-700">
              <button
                onClick={() => {
                  setShowEditMenu(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 rounded-t-md"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteAll}
                className="w-full text-left px-3 py-2 hover:bg-red-700 text-red-600"
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

          {showEditMenu && (
            <div
              ref={editMenuRef}
              className="absolute right-0 top-full mt-2 bg-[#1c1f26] rounded-md shadow-lg w-72 z-110 border border-gray-700 p-4 flex flex-col gap-3"
            >
              <label
                className="text-white text-sm font-semibold"
                htmlFor="edit-title-input"
              >
                Title
              </label>
              <input
                id="edit-title-input"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-[#252836] text-white rounded px-2 py-1 focus:outline-none"
              />

              <label
                className="text-white text-sm font-semibold"
                htmlFor="edit-description-input"
              >
                Description
              </label>
              <input
                id="edit-description-input"
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="bg-[#252836] text-white rounded px-2 py-1 focus:outline-none"
              />

              <label className="text-white text-sm font-semibold">
                Status Color
              </label>
              <div className="flex gap-2">
                {statusColors.map((color) => (
                  <button
                    key={color}
                    aria-label={`Select ${color} color`}
                    onClick={() => setSelectedStatusColor(color)}
                    className={`${color} w-6 h-6 rounded-full border-2 ${
                      selectedStatusColor === color
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    type="button"
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowEditMenu(false);
                    setShowMenu(false);
                  }}
                  className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description sous le titre */}
      {editedDescription && (
        <p className="text-gray-400 text-sm mb-4">{editedDescription}</p>
      )}

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 bg-[#1a1d24] text-sm text-white px-2 py-1 rounded focus:outline-none"
        aria-label="Search items"
      />

      {/* Liste des items avec DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
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

      {/* Ajouter un nouvel item */}
      <div className="mt-2 flex gap-2 items-center">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNewItem()}
          placeholder="Add new item..."
          className="flex-grow bg-transparent border-b border-gray-500 text-white focus:outline-none px-2 py-1 rounded"
          aria-label="Add new item"
        />
        <button
          onClick={handleAddNewItem}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          aria-label="Add item"
        >
          Add
        </button>
      </div>
    </section>
  );
};
