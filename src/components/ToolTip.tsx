import React, { useState } from 'react';

export interface TooltipProps {
  /** Texte à afficher dans l’infobulle */
  text: string;
  /** Élément enfant qui déclenche l’infobulle */
  children: React.ReactNode;
}

export const ToolTip = ({ text, children, ...props }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute bottom-full mb-2 p-2 bg-gray-700 text-white text-sm rounded shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};
