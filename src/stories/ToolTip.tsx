import React, { useState } from 'react';

export interface TooltipProps {
  /** Text to display in the tooltip */
  text: string;
  /** Child element that triggers the tooltip */
  children: React.ReactNode;
}

export const Tooltip = ({ text, children }: TooltipProps) => {
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
