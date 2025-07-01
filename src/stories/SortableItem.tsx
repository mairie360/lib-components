import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { Item } from "./Item";

type SortableItemProps = {
  id: string;
  title: string;
  description?: string;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

export const SortableItem = ({
  id,
  title,
  description,
  onClick,
  onDelete,
  onEdit,
  ...props
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      />
      <Item
        title={title}
        description={description}
        onClick={onClick}
        onDelete={onDelete}
        onEdit={onEdit}
        id={id}
      />
    </div>
  );
};
