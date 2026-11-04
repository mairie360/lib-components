import React, { useEffect, useId, useState } from 'react';
import { componentMarker } from '../component-marker';

export interface TooltipProps {
  /** Texte à afficher dans l’infobulle */
  text: string;
  /**
   * Trigger of the tooltip: a single focusable element (a button, a link). It receives
   * `aria-describedby`; a wrapper (`span`, fragment) around the focusable control would leave the
   * control undescribed.
   */
  children: React.ReactNode;
}

/**
 * RGAA 10.13 / 12.11 (MAIR-473): the tooltip shows on hover and on keyboard focus, stays while the
 * pointer moves onto it (it sits inside the hovered wrapper), and Escape hides it wherever the
 * focus is. Hover and focus are tracked apart, so leaving with the pointer keeps it shown while the
 * trigger still has the focus. The trigger is described by it (`aria-describedby`).
 */
export const ToolTip = ({ text, children, ...props }: TooltipProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = hovered || focused;
  const id = useId();

  useEffect(() => {
    if (!visible) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setHovered(false);
      setFocused(false);
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
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
