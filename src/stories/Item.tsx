import React from "react";
import { MoreHorizontal } from "lucide-react";

type ItemProps = {
  title?: string;
  description?: string;
  isdeleted?: boolean;
  onClick?: () => void;
  width?: string;
  height?: string;
};

/**
 * A functional React component that renders an interactive item with customizable
 * dimensions, title, description, and click behavior. The component is styled
 * with Tailwind CSS classes and includes a hover effect.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {string} props.title - The title text displayed at the top of the item.
 * @param {string} props.description - The description text displayed below the title.
 * @param {boolean} [props.isdeleted=false] - A flag indicating whether the item is marked as deleted.
 * @param {() => void} props.onClick - The callback function triggered when the item is clicked.
 * @param {string} [props.width="320px"] - The width of the item container.
 * @param {string} [props.height="80px"] - The height of the item container.
 * @returns {JSX.Element} The rendered item component.
 */
export const Item = ({
  title,
  description,
  isdeleted = false,
  onClick,
  width = "320px",
  height = "80px",
}: ItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl 
        border 
        border-gray-500 
        bg-[#0f1117] 
        text-white 
        px-4 
        py-3 
        cursor-pointer 
        transition 
        duration-150 
        hover:border-white 
        mx-auto
        flex flex-col 
        justify-between
        relative
      `}
      style={{ width, height }}
    >
      <div className="absolute top-3 right-3">
        <MoreHorizontal size={18} className="text-white" />
      </div>
      <div>
        {title && <h2 className="text-sm font-medium">{title}</h2>}
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
    </div>
  );
};
