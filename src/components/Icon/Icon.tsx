'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'width' | 'height'> {
  /** A lucide icon component, e.g. `Calendar` from `lucide-react`. */
  icon: LucideIcon;
  /** Size on the shared scale (12 / 16 / 20 / 24 / 32 px), `m` by default. */
  size?: Size;
  /** Accessible name; without it the icon is decorative (hidden from assistive technology). */
  label?: string;
}

/**
 * The only way to render an icon in the fronts (MAIR-608, Figma `Base/Icon`):
 * lucide glyph, typed size bound to the `--mairie-icon-*` tokens, current text colour.
 */
export const Icon = ({ icon: Glyph, size = 'm', label, className = '', style, ...props }: IconProps) => (
  <Glyph
    {...props}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? 'img' : undefined}
    focusable="false"
    data-size={size}
    className={`mairie-icon shrink-0 ${className}`.trim()}
    style={{ width: `var(--mairie-icon-${size})`, height: `var(--mairie-icon-${size})`, ...style }}
  />
);
