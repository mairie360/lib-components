import React, { useEffect, useId, useState } from 'react';
import { componentMarker } from '../component-marker';

export interface TooltipProps {
  /** Texte à afficher dans l’infobulle */
  text: string;
  /** Élément enfant qui déclenche l’infobulle */
  children: React.ReactNode;
}

/**
 * RGAA 10.13 / 12.11 (MAIR-473): the tooltip shows on hover and on keyboard focus, stays while the
 * pointer moves onto it (it sits inside the hovered wrapper), and Escape hides it wherever the
 * focus is. The trigger is described by it (`aria-describedby`) when it is a single element.
 */
export const ToolTip = ({ text, children, ...props }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!visible) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  const trigger = React.isValidElement<{ 'aria-describedby'?: string }>(children)
    ? React.cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      })
    : children;

  return (
    <div
      {...componentMarker('ToolTip', props)}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {trigger}
      {/* The transparent bottom padding replaces a margin: it bridges the gap above the trigger, so
          the pointer can move onto the bubble without leaving the wrapper (RGAA 10.13). */}
      <div id={id} role="tooltip" hidden={!visible} className="absolute bottom-full pb-2">
        <div className="p-2 bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)] text-sm rounded shadow-lg">{text}</div>
      </div>
    </div>
  );
};
