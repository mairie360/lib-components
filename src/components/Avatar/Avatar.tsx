'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';
import { componentMarker } from '../component-marker';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  /** Person's name: alt text of the photo and source of the initials. */
  alt?: string;
  /** Replaces the initials computed from `alt` when the image is missing or fails. */
  fallback?: React.ReactNode;
  /** Diameter on the shared avatar scale (xs 20 … xl 56 px). */
  size?: Size;
}
/** « Marie Martin » → « MM », « marie.martin@mairie.fr » → « M ». */
export function initialsOf(name: string | undefined): string {
  const words = (name ?? '').trim().split(/[\s._-]+/).filter(Boolean);
  return words.slice(0, 2).map(word => word[0]!.toUpperCase()).join('') || '?';
}
/** Module identity colours an initials avatar can take (each passes 3:1 against the page and 4.5:1 with `--mairie-on-module`). */
export const avatarColours = ['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'] as const;
/** Stable colour of a person: the same name always gets the same module colour. */
export function avatarColourOf(name: string | undefined): (typeof avatarColours)[number] {
  const key = (name ?? '').trim().toLowerCase();
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return avatarColours[hash % avatarColours.length]!;
}
const fontSizes: Record<Size, string> = { xs: '9px', s: '10px', m: 'var(--mairie-text-xs)', l: 'var(--mairie-text-s)', xl: 'var(--mairie-text-l)' };

/** A person's avatar: photo or initials on a colour derived from the name, on the shared scale (MAIR-608, Figma `Base/Avatar`). Brick of UserIdentity and AvatarStack. */
export function Avatar({ className = '', src, alt = '', fallback, size = 'm', style, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = Boolean(src) && !imageError;
  const colour = avatarColourOf(alt);
  return (
    <div data-slot="avatar" data-size={size} {...props} {...componentMarker('Avatar', props)} className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`.trim()} style={{ width: `var(--mairie-avatar-${size})`, height: `var(--mairie-avatar-${size})`, ...style }}>
      {showImage ? (
        <img data-slot="avatar-image" src={src} alt={alt} className="aspect-square size-full object-cover" onError={() => setImageError(true)} />
      ) : (
        <div data-slot="avatar-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} data-colour={colour} className="flex size-full items-center justify-center rounded-full font-semibold leading-none text-[var(--mairie-on-module)]" style={{ fontSize: fontSizes[size], backgroundColor: `var(--mairie-module-${colour})` }}>
          {fallback ?? initialsOf(alt)}
        </div>
      )}
    </div>
  );
}
