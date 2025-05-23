import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

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
 * @param {string} [props.width="320px"] - The width of the item container.
 * @param {string} [props.height="80px"] - The height of the item container.
 * @returns {JSX.Element} The rendered item component.
 */
export const Item = ({
  title,
  description,
  width = "320px",
  height = "80px",
}: ItemProps) => {
  const [pointIsClicked, setPointIsCliked] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);


  if (isDeleted) {
    return null; // Do not render the component if it is deleted
  }

  return (
    <div
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
      onClick={() => setPointIsCliked(false)}
    >
      <div
        className="absolute top-3 right-3  z-50 h-8 w-8 flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation(); // Prevent propagation to the parent
          setPointIsCliked(true); // Toggle correct here
        }}
      >
        {!pointIsClicked && <MoreHorizontal size={18} className="text-white" />}
      </div>
      <div>
        {title && <h2 className="text-sm font-medium">{title}</h2>}
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <div>
        {pointIsClicked && (
           <div className="absolute top-0 right-0 flex gap-2 z-60 w-auto h-full items-start p-2">

           {/* Bouton bleu - Modifier */}
           <div
              className="bg-blue-500 text-white p-2 h-full rounded-xl flex items-center cursor-pointer active:scale-95 active:brightness-90 transition-transform duration-100"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Modify color clicked");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.707.707L7 15l1.465-4.121a2 2 0 01.707-.707z"
                />
              </svg>
            </div>

         
           {/* Bouton rouge - Supprimer */}
           <div
             className="h-full bg-red-500 text-white p-2 rounded-xl flex items-center cursor-pointer"
             onClick={(e) => {
               e.stopPropagation();
               setIsDeleted(true);
             }}
           >
             <svg
               xmlns="http://www.w3.org/2000/svg"
               className="h-6 w-6 mr-1"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h6a1 1 0 011 1m-8 0h10"
               />
             </svg>
           </div>
         </div>
         
         
        )}
      </div>
    </div>
  );
};
