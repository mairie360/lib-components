'use client';

import React from 'react';
import { KeyRound, type LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { componentMarker } from '../component-marker';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'width' | 'height'> {
  /** A lucide icon component, e.g. `Calendar` from `lucide-react`. */
  icon: LucideIcon;
  /** Size on the shared scale (12 / 16 / 20 / 24 / 32 px), `m` by default. */
  size?: Size;
  /** Accessible name; without it the icon is decorative (hidden from assistive technology). */
  label?: string;
  /** MAIR-1151: turns the glyph (e.g. `icons['loader-circle']`) while something is in progress; still under `prefers-reduced-motion`. */
  spin?: boolean;
}

/**
 * The only way to render an icon in the fronts (MAIR-608, Figma `Base/Icon`):
 * lucide glyph, typed size bound to the `--mairie-icon-*` tokens, current text colour.
 */
export const Icon = ({ icon: Glyph, size = 'm', label, spin = false, className = '', style, ...props }: IconProps) => (
  <Glyph
    {...props}
    {...componentMarker('Icon', props)}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? 'img' : undefined}
    focusable="false"
    data-size={size}
    data-spin={spin || undefined}
    className={`mairie-icon shrink-0 ${spin ? 'motion-safe:animate-spin ' : ''}${className}`.trim()}
    style={{ width: `var(--mairie-icon-${size})`, height: `var(--mairie-icon-${size})`, ...style }}
  />
);

/**
 * MAIR-1071: the passkey glyph (Figma `Icon/key-round`). The FIDO Alliance passkey icon is not used until its
 * licence is cleared; the lucide key stands in everywhere (`<Icon icon={passkeyIcon} />`).
 */
export const passkeyIcon: LucideIcon = KeyRound;
