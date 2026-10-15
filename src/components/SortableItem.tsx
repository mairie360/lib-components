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
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Déplacer ${title}`}
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: 20,
          height: 28,
          zIndex: 20,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      ><span aria-hidden="true">⠿</span></button>
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
