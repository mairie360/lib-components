import React, { useState } from 'react';
import { componentMarker } from '../component-marker';

export interface TooltipProps {
  /** Texte à afficher dans l’infobulle */
  text: string;
  /** Élément enfant qui déclenche l’infobulle */
  children: React.ReactNode;
}

export const ToolTip = ({ text, children, ...props }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div {...componentMarker('ToolTip', props)} className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute bottom-full mb-2 p-2 bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] text-sm rounded shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};
