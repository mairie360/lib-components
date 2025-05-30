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

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  title,
  description,
  onClick,
  onDelete,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
