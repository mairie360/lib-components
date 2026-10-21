'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { mairie360LogoSrc } from '../assets/logo';

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'alt'> {
  /** Height on the logo scale (16 / 24 / 32 / 48 / 64 px): `l` in the sidebar, `xl` on the login page, `m` in compact bars. */
  size?: Size;
  /** Accessible name; "Mairie 360" by default, empty string for a decorative repeat. */
  alt?: string;
  /** Overrides the bundled asset (a front may serve its own `/mairie360-logo.png`). */
  src?: string;
}

/** The Mairie 360 logo at one of the five charte heights (MAIR-608, Figma `Base/Logo`). */
export const Logo = ({ size = 'm', alt = 'Mairie 360', src = mairie360LogoSrc, className = '', style, ...props }: LogoProps) => (
  // eslint-disable-next-line @next/next/no-img-element -- consumers choose their image loader; the asset is a bundled data URL.
  <img
    {...props}
    src={src}
    alt={alt}
    data-size={size}
    className={`mairie-logo block w-auto object-contain ${className}`.trim()}
    style={{ height: `var(--mairie-logo-${size})`, ...style }}
  />
);
