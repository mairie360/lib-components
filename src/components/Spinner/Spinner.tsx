import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Diameter on the icon scale (xs 12 … xl 32 px). */
  size?: Size;
  /** Announced text; without it the spinner is decorative (the parent carries aria-busy). */
  label?: string;
}

/** Circular activity indicator for a short wait (MAIR-608, Figma `Base/Spinner`). */
export const Spinner = ({ size = 'm', label, className = '', style, ...props }: SpinnerProps) => (
  <span {...props} role={label ? 'status' : undefined} aria-hidden={label ? undefined : true} data-size={size}
    className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--mairie-accent)] ${className}`.trim()}
    style={{ width: `var(--mairie-icon-${size})`, height: `var(--mairie-icon-${size})`, ...style }}>
    {label && <span className="sr-only">{label}</span>}
  </span>
);
