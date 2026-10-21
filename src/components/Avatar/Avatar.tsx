'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

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
const fontSizes: Record<Size, string> = { xs: '9px', s: '10px', m: 'var(--mairie-text-xs)', l: 'var(--mairie-text-s)', xl: 'var(--mairie-text-l)' };

/** A person's avatar: photo or initials on the shared scale (MAIR-608, Figma `Base/Avatar`). Brick of UserIdentity and AvatarStack. */
export function Avatar({ className = '', src, alt = '', fallback, size = 'm', style, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = Boolean(src) && !imageError;
  return (
    <div data-slot="avatar" data-size={size} {...props} className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`.trim()} style={{ width: `var(--mairie-avatar-${size})`, height: `var(--mairie-avatar-${size})`, ...style }}>
      {showImage ? (
        <img data-slot="avatar-image" src={src} alt={alt} className="aspect-square size-full object-cover" onError={() => setImageError(true)} />
      ) : (
        <div data-slot="avatar-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} className="flex size-full items-center justify-center rounded-full bg-[var(--mairie-action-background)] font-semibold leading-none text-[var(--mairie-on-action)]" style={{ fontSize: fontSizes[size] }}>
          {fallback ?? initialsOf(alt)}
        </div>
      )}
    </div>
  );
}
