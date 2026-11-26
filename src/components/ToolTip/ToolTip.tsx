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
  /**
   * Side of the trigger the bubble sits on: `top` (default) or `bottom`, for a trigger at the top edge of a
   * clipped panel or under a top bar, where a bubble above would be cut or hidden.
   */
  placement?: 'top' | 'bottom';
  /** Edge of the trigger the bubble lines up with: `start` (default) or `end`, for a trigger at the right edge. */
  align?: 'start' | 'end';
}

/**
 * RGAA 10.13 / 12.11 (MAIR-473): the tooltip shows on hover and on keyboard focus, stays while the
 * pointer moves onto it (it sits inside the hovered wrapper), and Escape hides it wherever the
 * focus is. Hover and focus are tracked apart, so leaving with the pointer keeps it shown while the
 * trigger still has the focus. The trigger is described by it (`aria-describedby`).
 */
export const ToolTip = ({ text, children, placement = 'top', align = 'start', ...props }: TooltipProps) => {
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
      {/* The transparent padding on the trigger side replaces a margin: it bridges the gap to the trigger, so
          the pointer can move onto the bubble without leaving the wrapper (RGAA 10.13). */}
      <div
        id={id}
        role="tooltip"
        hidden={!visible}
        data-placement={placement}
        data-align={align}
        className={`absolute z-50 ${placement === 'bottom' ? 'top-full pt-2' : 'bottom-full pb-2'} ${align === 'end' ? 'right-0' : 'left-0'}`}
      >
        <div className="mairie-tooltip-bubble whitespace-nowrap bg-[var(--mairie-neutral-action)] font-medium text-[var(--mairie-on-neutral)] shadow-lg" style={{ padding: '6px 10px', borderRadius: 'var(--mairie-radius-s)', fontSize: 13 }}>{text}</div>
      </div>
    </div>
  );
};
